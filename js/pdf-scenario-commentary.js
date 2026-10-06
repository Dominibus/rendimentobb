// Describes model outputs without certifying the investment or input data.
export function buildPDFScenarioCommentary({cashflow, annualDebtService, dscr}, T=(it)=>it){
  const debt = Number.isFinite(annualDebtService) && annualDebtService > 0;
  const coverage = Number.isFinite(dscr) ? dscr : null;
  const insight = cashflow < 0
    ? T('Lo scenario presenta un disavanzo di cassa. Rivedi ricavi, costi e finanziamento prima di interpretare il rendimento.', 'The scenario has a cashflow deficit. Review revenue, costs and financing before interpreting returns.')
    : cashflow === 0
      ? T('Lo scenario è in pareggio sul cashflow e non lascia margine per imprevisti. Verifica le ipotesi con dati effettivi.', 'The scenario breaks even on cashflow and leaves no buffer for unforeseen costs. Check the assumptions against actual data.')
      : debt && coverage !== null && coverage < 1
        ? T('Il cashflow è positivo, ma il reddito operativo non copre le rate nello scenario. Verifica la composizione dei dati e il finanziamento.', 'Cashflow is positive, but operating income does not cover debt payments in the scenario. Check the inputs and financing.')
        : T('Il cashflow è positivo nelle ipotesi inserite. Non verifica la redditività effettiva: confronta uno scenario con ricavi inferiori e controlla tutti i costi.', 'Cashflow is positive under the entered assumptions. This does not verify actual profitability: compare a lower-revenue scenario and check all costs.');
  const financingLabel = !debt
    ? T('Nessuna rata di finanziamento nello scenario', 'No debt payments in this scenario')
    : coverage === null
      ? T('DSCR non disponibile: verifica la copertura', 'DSCR unavailable: check debt coverage')
      : coverage < 1
        ? T('DSCR sotto 1: rate non coperte dal reddito operativo', 'DSCR below 1: operating income does not cover debt payments')
        : coverage < 1.2
          ? T('DSCR tra 1 e 1,2: margine di copertura limitato', 'DSCR between 1 and 1.2: limited coverage buffer')
          : T('DSCR almeno 1,2 nelle ipotesi simulate', 'DSCR at least 1.2 under the simulated assumptions');
  return {rating:T('Stima su ipotesi','Model estimate'), insight, financingLabel};
}
