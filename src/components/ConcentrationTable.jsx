import React from 'react'
export default function ConcentrationTable({ concentration }) {
  return <div className="concentration-scroll"><table className="concentration-table"><thead><tr><th>Required capability</th><th>Qualified holders</th><th>Concentration risk</th></tr></thead><tbody>{concentration.map(item => <tr key={item.capability} className={item.flag}><th scope="row">{item.capability}</th><td className="matching-data">{item.holders.length}</td><td><span className={`matching-tag ${item.flag}`}>{item.flag === 'critical' ? '🚨 CRITICAL' : item.flag === 'watch' ? '⚠ WATCH' : 'OK'}</span></td></tr>)}</tbody></table></div>
}
