const fmt = (n) => Math.round(parseFloat(n) || 0).toLocaleString()

function Metric({ label, value, color, sub }) {
  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '10px 11px',
      marginBottom: 7
    }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 3, fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: color || 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function Summary({ stats }) {
  const { income, totalExp, surplus, savRate, owedThb, owingThb, netDebt } = stats

  return (
    <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{
        fontSize: 10, fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase',
        letterSpacing: '.07em', fontFamily: 'var(--font-display)', marginBottom: 10
      }}>Summary</div>

      <Metric label="Total income" value={fmt(income)} color="var(--success)" />
      <Metric label="Total expenses" value={fmt(totalExp)} />
      <Metric
        label="Monthly surplus"
        value={(surplus >= 0 ? '+' : '') + fmt(surplus)}
        color={surplus >= 0 ? 'var(--success)' : 'var(--danger)'}
        sub="income minus all expenses"
      />
      <Metric
        label="Savings rate"
        value={savRate + '%'}
        color={savRate >= 20 ? 'var(--success)' : savRate >= 10 ? 'var(--accent)' : 'var(--danger)'}
      />
      <Metric
        label="Net debt position"
        value={(netDebt >= 0 ? '+' : '') + fmt(netDebt)}
        color={netDebt >= 0 ? 'var(--success)' : 'var(--danger)'}
        sub={netDebt >= 0 ? 'you are net owed' : 'you are net owing'}
      />
    </div>
  )
}
