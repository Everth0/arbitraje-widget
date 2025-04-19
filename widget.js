// Configuración
const PAIRS = ['BTCUSDT', 'ETHBTC', 'ETHUSDT'];
const FEE = 0.001; // 0.1% fee
const UPDATE_INTERVAL = 15000; // 15 segundos

// Función principal
async function initArbitrageWidget() {
  try {
    const prices = await Promise.all(PAIRS.map(async pair => {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
      const data = await response.json();
      return { pair, price: parseFloat(data.price) };
    });

    const priceObj = Object.fromEntries(prices.map(p => [p.pair, p.price]));
    updateUI(priceObj);
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById('arbitrage-results').innerHTML = `
      <p style="color: #e74c3c;">⚠ Error al cargar datos. Intenta recargar.</p>
    `;
  }
}

// Actualizar la interfaz
function updateUI(prices) {
  const theoreticalPrice = prices.BTCUSDT * prices.ETHBTC;
  const spread = ((prices.ETHUSDT - theoreticalPrice) / theoreticalPrice) * 100;
  const netProfit = spread - (3 * FEE * 100);
  
  const resultsDiv = document.getElementById('arbitrage-results');
  resultsDiv.innerHTML = netProfit > 0.5 ? `
    <div style="background: #e8f5e9; padding: 10px; border-radius: 5px;">
      <p style="color: #27ae60; font-weight: bold;">💰 Oportunidad (+${netProfit.toFixed(2)}% neto)</p>
      <p><strong>Ruta:</strong> BTC → ETH → USDT → BTC</p>
      <p>ETH/USDT teórico: $${theoreticalPrice.toFixed(2)}</p>
      <p>ETH/USDT real: $${prices.ETHUSDT.toFixed(2)}</p>
    </div>
  ` : `
    <p style="color: #e67e22;">No hay oportunidades (Spread: ${spread.toFixed(2)}%)</p>
  `;
  
  document.getElementById('update-time').textContent = new Date().toLocaleTimeString();
}

// Iniciar y actualizar
initArbitrageWidget();
setInterval(initArbitrageWidget, UPDATE_INTERVAL);
