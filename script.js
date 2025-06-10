function validateCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let t = cnpj.length - 2, d = cnpj.substring(t), d1 = parseInt(d.charAt(0)), d2 = parseInt(d.charAt(1));
  let calc = x => {
    let n = cnpj.substring(0, x), y = x - 7, s = 0, r = 0;
    for (let i = x; i >= 1; i--) {
      s += n.charAt(x - i) * y--;
      if (y < 2) y = 9;
    }
    r = s % 11 < 2 ? 0 : 11 - s % 11;
    return r;
  };
  return calc(t) === d1 && calc(t + 1) === d2;
}

function generateCNPJ() {
  let n = '';
  for (let i = 0; i < 8; i++) n += Math.floor(Math.random() * 10);
  n += '0001';
  let calc = x => {
    let n2 = n, y = x - 7, s = 0, r = 0;
    for (let i = x; i >= 1; i--) {
      s += n2.charAt(x - i) * y--;
      if (y < 2) y = 9;
    }
    r = s % 11 < 2 ? 0 : 11 - s % 11;
    return r;
  };
  let d1 = calc(12);
  let d2 = calc(13);
  return n + d1 + d2;
}

document.getElementById('validate-btn').onclick = function() {
  const input = document.getElementById('cnpj-input').value;
  const result = document.getElementById('result');
  result.textContent = validateCNPJ(input) ? 'Valid CNPJ!' : 'Invalid CNPJ!';
};

document.getElementById('generate-btn').onclick = function() {
  const cnpj = generateCNPJ();
  document.getElementById('cnpj-input').value = cnpj;
  document.getElementById('result').textContent = 'Generated CNPJ: ' + cnpj;
};

document.getElementById('random-btn').onclick = function() {
  const cnpj = generateCNPJ();
  document.getElementById('result').textContent = 'Random CNPJ: ' + cnpj;
};

document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key.toLowerCase() === 'g') {
    document.getElementById('generate-btn').click();
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'v') {
    document.getElementById('validate-btn').click();
  }
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {
    document.getElementById('random-btn').click();
  }
});
