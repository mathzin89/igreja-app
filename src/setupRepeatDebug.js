// Salva a função original
const _repeat = String.prototype.repeat;

// Substitui por um wrapper de debug
String.prototype.repeat = function(count) {
  if (count < 0) {
    console.error("🚨 String.repeat chamado com valor negativo:", count, " na string:", this.toString());
    console.trace();
    // Evita travar o app retornando string vazia
    return "";
  }
  return _repeat.call(this, count);
};

console.log("✅ Monitor de String.repeat ativado no setup");
