var datos = [
	0,
	0,
	0,
	0,
	0,
	40,
	138,
	140,
	286,
	300,
	320,
	406,
	425,
	430,
	460
]

function crearHistogramaDeFrecuencias(datos) {
	console.log("len:", datos.length)
	var od = datos.sort(function (a, b) { return a - b })
	console.log(od)

	var dataVal = []
	dataVal.push(od[0])
	var auxDataVal = od[0]
	for (var i = 1; i < datos.length; i++) {
		if (auxDataVal != od[i]) {
			dataVal.push(od[i]);
			auxDataVal = od[i]
		}
	}

	var contador = []
	var auxcontador = 0

	for (var i = 0; i < dataVal.length; i++) {
		auxcontador = 0
		for (var j = 0; j < od.length; j++) {
			if (dataVal[i] == od[j]) {
				auxcontador++;
			}
		}
		contador[i] = auxcontador;
	}
	console.log(contador)
	var inter = Math.ceil(Math.sqrt(od.length));
	console.log("valored del array:", dataVal, "\ncantidad de V:", dataVal.length, "canta:", dataVal.length / inter)

	var tamClases = Math.round(dataVal.length / inter)
	console.log("Tamano de classes:", tamClases, "Cantidad de Intervalos:", inter)
	var frecuencia = []
	var interClass = []

	for (var i = 0; i < inter - 1; i++) {
		frecuencia[i] = sumClass(contador.slice(tamClases * i, tamClases * (i + 1)))
		if (i < inter - 1) {
			interClass[i] = dataVal[tamClases * i] + "-" + (dataVal[(tamClases * (i + 1))] - 1)
		} else {
			interClass[i] = dataVal[tamClases * i] + "-" + dataVal[(tamClases * (i)) + 1]
		}
	}
	frecuencia.push(sumClass(contador.slice(tamClases * (inter - 1))))
	interClass.push(">" + dataVal[tamClases * (inter - 1)])
	console.log("Frecuencia:", frecuencia)
	console.log("clases:", interClass)

	function sumClass(arr) {
		let suma = 0
		for (var i = 0; i < arr.length; i++) {
			suma += arr[i]
		}
		return suma
	}
}