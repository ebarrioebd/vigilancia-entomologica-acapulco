function calculatePercentiles(data, percentiles) {
	// Primero, ordenar los datos
	data.sort((a, b) => a - b);

	// Inicializar un objeto para almacenar los resultados
	let result = {};

	// Calcular cada percentil y almacenarlos en el objeto de resultados
	for (let i = 0; i < percentiles.length; i++) {
		let percentile = percentiles[i];
		let index = (percentile / 100) * data.length;
		if (Math.floor(index) === index) {
			result[percentile + "%"] = (data[index - 1] + data[index]) / 2;
		} else {
			result[percentile + "%"] = data[Math.floor(index)];
		}
	}

	// Devolver el objeto de resultados
	return result;
}
//////////////////////////////////////////////
function calculateHistogram(data) {
	// Crear un objeto para almacenar las frecuencias
	var frequencies = {};

	// Recorrer los datos y contar la frecuencia de cada número
	for (var i = 0; i < data.length; i++) {
		var num = data[i];
		if (frequencies[num]) {
			frequencies[num]++;
		} else {
			frequencies[num] = 1;
		}
	}

	// Devolver el objeto de frecuencias
	return frequencies;
}
//////////////////////////////////////////////
function histogramClasses(data, binSize) {
	// Ordenar los datos
	data.sort((a, b) => a - b);

	// Determinar el rango de los datos
	let min = data[0];
	let max = data[data.length - 1];

	// Calcular el número de clases
	let classCount = Math.ceil((max - min) / binSize);

	// Inicializar el histograma de clases
	let histogram = Array(classCount).fill(0);

	// Calcular la frecuencia de cada clase
	for (let i = 0; i < data.length; i++) {
		let classIndex = Math.floor((data[i] - min) / binSize);
		histogram[classIndex] += 1;
	}

	// Devolver el histograma de clases
	return histogram;
}
///////////////////////////////////////////////
function curtosis(data) {
	let sum = 0;
	let mean = 0;
	let N = data.length;

	for (let i = 0; i < N; i++) {
		sum += data[i];
	}

	mean = sum / N;

	sum = 0;

	for (let i = 0; i < N; i++) {
		sum += Math.pow(data[i] - mean, 4);
	}
	console.log("dev:", standardDeviation(data))
	let curtosis = (sum / N) / Math.pow(standardDeviation(data), 4);

	return curtosis;
}
function mean(data) {
	let sum = 0; 
	let N = data.length; 
	for (let i = 0; i < N; i++) {
		sum += data[i];
	} 
	return   sum / N;
}
function standardDeviation(data) {
	let sum = 0;
	let mean = 0;
	let N = data.length;

	for (let i = 0; i < N; i++) {
		sum += data[i];
	}

	mean = sum / N;

	sum = 0;

	for (let i = 0; i < N; i++) {
		sum += Math.pow(data[i] - mean, 2);
	}

	let standardDeviation = Math.sqrt(sum / (N - 1));

	return standardDeviation;
}
////////////////////////////////////////////
function quartiles(data) {
	// Ordenar los datos de menor a mayor
	data.sort((a, b) => a - b);

	// Calcular el número de elementos en el conjunto de datos
	const n = data.length;

	// Calcular los índices de los cuartiles
	const q1Index = Math.floor(n / 4);
	const q2Index = Math.floor(n / 2);
	const q3Index = Math.floor(3 * n / 4);

	// Calcular los valores de los cuartiles
	const q1 = data[q1Index];
	const q2 = data[q2Index];
	const q3 = data[q3Index];

	// Devolver un objeto con los valores de los cuartiles
	return { q1, q2, q3 };
}
function varza(m,x){
    let suma=0
	for (let i = 0; i < x.length; i++) {
		suma += Math.pow(x[i]-m,2);
	}
	return suma/(x.length-1)
}
//////////////////////////////////////////////
var data = [1,2,3,4,5,6,7,8,9,5,4,3,2,1,0]
var data=[260,240,0,300,160,0,0,0,0,0,0,0,0,0,0,0]
console.log("data:", data)
////////////////////////////////////////////
var histogram = calculateHistogram(data);
console.log("histograma:", histogram);
///////////////////////////////////////////
let percentiles = [40, 50, 75, 90];
let result = calculatePercentiles(data, percentiles);
console.log("Percentiles:", result);
//////////////////////////////////////////////// 
// Ejemplo de uso 
let binSize = 4;
let histogramData = histogramClasses(data, binSize);
console.log('histogrmaClasses:', histogramData);
// Output: [ 1, 2, 2, 2, 2, 2, 2 ]
let curto = curtosis(data)
console.log('curtosis:', curto)
///cuartiles
const qn = quartiles(data);
console.log("cuartiles:", qn)
var media=mean(data)
var desviac=standardDeviation(data)
console.log("media:",media)
console.log("varianza:",varza(media,data))
var coef_variacion=(desviac/Math.abs(media))
console.log("coef:",coef_variacion)
var orderD=data.sort()
console.log("min:",orderD[0]," max:",orderD[data.length-1]," Range:",(orderD[0]-orderD[data.length-1]))
