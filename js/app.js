function calculate() {
  const price = parseFloat(document.getElementById("price").value);
  const occupancy = parseFloat(document.getElementById("occupancy").value);
  const expenses = parseFloat(document.getElementById("expenses").value);
  const commission = parseFloat(document.getElementById("commission").value);
  const tax = parseFloat(document.getElementById("tax").value);

  const resultsDiv = document.getElementById("results");

  if (
    isNaN(price) ||
    isNaN(occupancy) ||
    isNaN(expenses) ||
    isNaN(commission) ||
    isNaN(tax)
  ) {
    resultsDiv.innerHTML = "Inserisci valori validi";
    return;
  }

  const nights = 30 * (occupancy / 100);
  const gross = price * nights;
  const platformFees = gross * (commission / 100);
  const profitBeforeTax = gross - expenses - platformFees;
  const taxes = profitBeforeTax * (tax / 100);
  const netMonthly = profitBeforeTax - taxes;
  const netYearly = netMonthly * 12;

  resultsDiv.innerHTML = `
    Fatturato lordo mensile: € ${gross.toFixed(2)} <br>
    Commissioni piattaforme: € ${platformFees.toFixed(2)} <br>
    Utile prima delle tasse: € ${profitBeforeTax.toFixed(2)} <br>
    Tasse: € ${taxes.toFixed(2)} <br><br>
    <strong>Guadagno netto mensile: € ${netMonthly.toFixed(2)}</strong><br>
    <strong>Guadagno netto annuale: € ${netYearly.toFixed(2)}</strong>
  `;
}
