from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import psycopg2.extras
import os

app = Flask(__name__)
CORS(app)

def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"], cursor_factory=psycopg2.extras.RealDictCursor)

def query(sql, params=(), one=False, commit=False):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(sql, params)
    if commit:
        conn.commit()
        result = cur.rowcount
    else:
        result = cur.fetchone() if one else cur.fetchall()
    cur.close()
    conn.close()
    return result

# ── Settings ──────────────────────────────────────────────

@app.route("/api/settings", methods=["GET"])
def get_settings():
    rows = query("SELECT key, value FROM settings")
    return jsonify({r["key"]: r["value"] for r in rows})

@app.route("/api/settings", methods=["PUT"])
def update_settings():
    data = request.json
    for k, v in data.items():
        query("INSERT INTO settings(key,value) VALUES(%s,%s) ON CONFLICT(key) DO UPDATE SET value=%s",
              (k, str(v), str(v)), commit=True)
    return jsonify({"ok": True})

# ── Months ────────────────────────────────────────────────

@app.route("/api/months", methods=["GET"])
def list_months():
    rows = query("SELECT id, year, month FROM months ORDER BY year, month")
    return jsonify(list(rows))

@app.route("/api/months/<int:year>/<int:month>", methods=["GET"])
def get_month(year, month):
    row = query("SELECT id, year, month FROM months WHERE year=%s AND month=%s", (year, month), one=True)
    if not row:
        return jsonify(None), 404
    entries = query("SELECT id, category, label, amount, currency, sort_order, paid FROM entries WHERE month_id=%s ORDER BY category, sort_order", (row["id"],))
    return jsonify({"month": dict(row), "entries": [dict(e) for e in entries]})

@app.route("/api/months", methods=["POST"])
def create_month():
    data = request.json
    year, month = data["year"], data["month"]
    existing = query("SELECT id FROM months WHERE year=%s AND month=%s", (year, month), one=True)
    if existing:
        return jsonify({"id": existing["id"]}), 200
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO months(year,month) VALUES(%s,%s) RETURNING id", (year, month))
    new_id = cur.fetchone()["id"]
    # copy entries from source month if provided
    src = data.get("copy_from")
    if src:
        src_month = query("SELECT id FROM months WHERE year=%s AND month=%s", (src["year"], src["month"]), one=True)
        if src_month:
            cur.execute("""
                INSERT INTO entries(month_id,category,label,amount,currency,sort_order)
                SELECT %s,category,label,amount,currency,sort_order FROM entries WHERE month_id=%s
            """, (new_id, src_month["id"]))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"id": new_id}), 201

# ── Entries ───────────────────────────────────────────────

@app.route("/api/entries", methods=["POST"])
def create_entry():
    d = request.json
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO entries(month_id,category,label,amount,currency,sort_order,paid)
        VALUES(%s,%s,%s,%s,%s,(SELECT COALESCE(MAX(sort_order),0)+1 FROM entries WHERE month_id=%s AND category=%s),%s)
        RETURNING id
    """, (d["month_id"], d["category"], d["label"], d.get("amount",0), d.get("currency","THB"), d["month_id"], d["category"], d.get("paid", False)))
    new_id = cur.fetchone()["id"]
    conn.commit(); cur.close(); conn.close()
    return jsonify({"id": new_id}), 201

@app.route("/api/entries/<int:entry_id>", methods=["PUT"])
def update_entry(entry_id):
    d = request.json
    fields = []
    vals = []
    for f in ["label", "amount", "currency", "paid"]:
        if f in d:
            fields.append(f"{f}=%s")
            vals.append(d[f])
    if not fields:
        return jsonify({"ok": True})
    vals.append(entry_id)
    query(f"UPDATE entries SET {', '.join(fields)} WHERE id=%s", vals, commit=True)
    return jsonify({"ok": True})

@app.route("/api/entries/<int:entry_id>", methods=["DELETE"])
def delete_entry(entry_id):
    query("DELETE FROM entries WHERE id=%s", (entry_id,), commit=True)
    return jsonify({"ok": True})

# ── Debt Payments ───────────────────────────────────────────────

@app.route("/api/entries/<int:entry_id>/payments", methods=["GET"])
def get_payments(entry_id):
    rows = query("SELECT id, amount, payment_date, note, created_at FROM debt_payments WHERE entry_id=%s ORDER BY payment_date DESC", (entry_id,))
    return jsonify([dict(r) for r in rows])

@app.route("/api/entries/<int:entry_id>/payments", methods=["POST"])
def create_payment(entry_id):
    d = request.json
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO debt_payments(entry_id, amount, payment_date, note)
        VALUES(%s, %s, %s, %s) RETURNING id
    """, (entry_id, d.get("amount", 0), d.get("payment_date"), d.get("note", "")))
    new_id = cur.fetchone()["id"]
    conn.commit(); cur.close(); conn.close()
    return jsonify({"id": new_id}), 201

@app.route("/api/payments/<int:payment_id>", methods=["DELETE"])
def delete_payment(payment_id):
    query("DELETE FROM debt_payments WHERE id=%s", (payment_id,), commit=True)
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
