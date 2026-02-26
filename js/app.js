function formatCurrency(value) {
  return new Intl.NumberFormat(currentLang === "it" ? "it-IT" : "en-US", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

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
    resultsDiv.innerHTML = translations[currentLang].invalidValues;
    return;
  }

  const nights = 30 * (occupancy / 100);
  const gross = price * nights;
  const platformFees = gross * (commission / 100);
  const profitBeforeTax = gross - expenses - platformFees;
  const taxes = profitBeforeTax * (tax / 100);
  const netMonthly = profitBeforeTax - taxes;
  const netYearly = netMonthly * 12;

  const netClass = netMonthly >= 0 ? "positive" : "negative";

  resultsDiv.innerHTML = `
    <div>
      ${currentLang === "it" ? "Fatturato lordo mensile:" : "Monthly gross revenue:"}
      ${formatCurrency(gross)}
    </div>

    <div>
      ${currentLang === "it" ? "Commissioni piattaforme:" : "Platform fees:"}
      ${formatCurrency(platformFees)}
    </div>

    <div>
      ${currentLang === "it" ? "Utile prima delle tasse:" : "Profit before taxes:"}
      ${formatCurrency(profitBeforeTax)}
    </div>

    <div>
      ${currentLang === "it" ? "Tasse:" : "Taxes:"}
      ${formatCurrency(taxes)}
    </div>

    <br>

    <div class="${netClass}">
      ${currentLang === "it" ? "Guadagno netto mensile:" : "Net monthly profit:"}
      ${formatCurrency(netMonthly)}
    </div>

    <div class="${netClass}">
      ${currentLang === "it" ? "Guadagno netto annuale:" : "Net yearly profit:"}
      ${formatCurrency(netYearly)}
    </div>
  `;
}
