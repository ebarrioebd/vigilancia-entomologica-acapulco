console.log("mapacalor.js")


/**
 * Prepara mapa de calor
 */
var imgOpaci = "",
    imgKrig = "",
    imgIDW = "";
var ovitrampas;
var zona;
var positions = [];
var zonaCoord = [];
var scope = new L.polyline([0, 0]);


var interpoladoresButton = L.control({ position: 'topleft' });
var botonesControlCSV = L.control({ position: 'bottomleft' });
var botonesControlInfo = L.control({ position: 'topright' });
var botonesControlRango = L.control({ position: 'topleft' });
botonesControlRango.onAdd = function () { // creación de los botones
    var botones = L.DomUtil.create('div', 'class-css-botones');
    botones.innerHTML = "<div style='color: black;background:#34c234b5'>Porcentaje Bajo</div><div style='color: black;background:#d3d331b5'>Porcentaje Medio</div><div style='color: black;background:#ff0000b5'>Porcentaje Alto</div>"
    return botones;
};
//botonesControlRango.addTo(map);
//add Controls Map
interpoladoresButton.onAdd = function () {
    var botones = L.DomUtil.create('div', 'class-css-botones');
    botones.innerHTML = `<div id="id_radio">
                    <p>Interpolador</p>
                    <input type="radio" name="kriging" value="kriging" id="kriging" onClick="ck()"> Kriging <br>
                    <input type="radio" name="idw" value="idw" id="idw" onClick="cidw()"> IDW <br>
                    <!--<input type="radio" name="fbr" value="fbr" id="fbr" onClick="cfbr()" ochange="Funcion de Base Radial"> FBR </div>-->`;
    //botones.innerHTML += ``; 
    return botones;
}
interpoladoresButton.addTo(mapCSVInter);

botonesControlCSV.onAdd = function () { // creación de los botones
    var botones = L.DomUtil.create('div', 'class-css-botones');
    botones.innerHTML = `<buttom  id="agregar-marcadoresCSV" class="btn btn-primary" style="background:'green'">Mostrar Marcadores</buttom>`;
    botones.innerHTML += `<buttom  id="remover-marcadoresCSV" class="btn btn-warning">Ocultar Marcadores</buttom>`;
    return botones;
};
botonesControlCSV.addTo(mapCSVInter); // adición del contenedor dentro del mapa
/*
const colors = ["#006837", "#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf", "#fee08b", "#fdae61",
    "#f46d43", "#d73027", "#a50026"
];
*/
const colors = ["#2791c5","#5fa2b3","#8cb8a4","#d6e37d","#f9fa64","#fbce52","#fba440","#e87329","#f14d1e","#e71914"];
/*
const colors = ["#190449","#1328e1","#005ff4","#7386f1","#b9ecf1","#f6fca1","#fd5316","#ff1006","#df140f","#6d0c0f"]
*/
/*new code*/
function inv(params) {
    //console.log("get :"+params.length)
    //console.log(params)
    let a = new Array(params.length);
    for (var i = 0; i < params.length; i++) {
        a[i] = [params[i][1], params[i][0]]
    }
    //console.log(a)
    //console.log("return :"+a.length)
    return a
}

function getMaxValor(z) {
    //console.log("getV(Z):",z)
    var d = []
    for (var i = 0; i < z.length; i++) {
        d.push(z[i].cantidad_huevos)
    }
    return [0, Math.max.apply(null, d)]
    //return [Math.min.apply(null, d), Math.max.apply(null, d)]
};

function getC(v, maximo) {
    var z = v / maximo
    if (z < 0) { z = 0 } else if (z > 1) { z = 1 } else if (isNaN(z)) { z = 0 }
    return colors[Math.floor((colors.length - 1) * z)]
}
//correlacio
function correlacio(mD, z) {
    var pZ = 0;
    var wij = Array(z.length).fill(0).map(() => Array(z.length).fill(0));
    console.log("wij:", wij)
    for (var i = 0; i < z.length; i++) {
        pZ += z[i][0];
    };
    pZ /= z.length;
    var sW = 0;
    var sWVAR_X = 0,
        sVAR2 = 0;
    for (var i = 0; i < z.length; i++) {
        for (var j = 0; j < z.length; j++) {
            if (i !== j) {
                wij[i][j] = (1 / Math.pow(mD[i][j], 1));
                sW += wij[i][j];
                sWVAR_X += (wij[i][j] * (z[i] - pZ)) * (z[j] - pZ);
            } else {
                wij[i][j] = 0;
            }
        }
        sVAR2 += Math.pow(z[i] - pZ, 2);
    };
    var Imoran = ((z.length) * sWVAR_X) / (sW * sVAR2);
    console.log("Imoran:", Imoran)
    console.log("wij:", wij)
    console.log("pZ:", pZ);
}
///crea una imagen con A,B como sus dimenciones
//zi arrays de valores para cada cuadro dentro
//id del canvas
function creaImagen(A, B, zi, id) {
    var canvas = document.getElementById(id);
    var ctx = canvas.getContext("2d");
    canvas.width = 1000;
    canvas.height = 1000;
    var x0 = 0,
        y0 = 0,
        x1 = 0,
        y1 = 0;
    var k = 0;
    var max = getMaxValor(ovitrampas);
    for (var i = 0; i < A; i++) {
        y0 = 0;
        y1 = 0;
        y1 = canvas.width
        y0 = y1 - (canvas.height / B)
        for (var j = 0; j < B; j++) {
            x1 = canvas.width / A
            y1 = canvas.height / B
            if (zi[k] !== (-1)) {
                ctx.fillStyle = getC(zi[k], max[1]);
                //console.log("getC()",getC(zi[k],rango,max[0]),zi[k])
                ctx.fillRect(x0, y0, x1, y1);
            }
            //ctx.strokeRect(x0, y0, x1, y1);
            y0 -= (canvas.width / B)
            y1 -= (canvas.width / B)
            k++;
        }
        x0 += canvas.width / A
        x1 += canvas.width / A
    }
    //function returnImgae() {
    return canvas.toDataURL("image/png");
    //}
}

function closeWCSVInter() {
    document.getElementById("interpolarCSV").style.top = "";
}

function ck() {
    mapCSVInter.removeLayer(imgOpaci)
    imgOpaci = imgKrig
    document.getElementById("idw").checked = false
    //document.getElementById("fbr").checked=false
    imgOpaci.addTo(mapCSVInter)
}

function cidw() {
    mapCSVInter.removeLayer(imgOpaci)
    imgOpaci = imgIDW
    //document.getElementById("fbr").checked=false
    document.getElementById("kriging").checked = false
    imgOpaci.addTo(mapCSVInter)
}

function updateOpacity(value) {
    imgOpaci.remove()
    imgOpaci = L.imageOverlay(returnImgae(), imageBounds, {
        opacity: value
    }).addTo(mapCSVInter);
}

function inv(params) {
    //console.log("get :"+params.length)
    //console.log(params)
    let a = new Array(params.length);
    for (var i = 0; i < params.length; i++) {
        a[i] = [params[i][1], params[i][0]]
    }
    //console.log(a)
    //console.log("return :"+a.length)
    return a
}

function addTablaIndicador(data) {
    var max = getMaxValor(data);
    var v1 = 0;
    var v2 = "";
    var divRango = "<div style='color: black;font-family: revert;background: whitesmoke;'>Densidad de Huevos</div>";
    for (var i = 0; i < colors.length; i++) {
        v2 += "" + Math.round(v1) + "-";
        v1 += (max[1]) / colors.length
        v2 += Math.round(v1) + ""
        divRango += "<div id='rango' style='color:black;background:" + colors[i] + "'>" + v2 + "</div>";
        v2 = "";
    }
    botonesControlInfo.onAdd = function () { // creación de los botones
        var botones = L.DomUtil.create('div', 'class-css-botones');
        botones.innerHTML += divRango
        return botones;
    };
    botonesControlInfo.addTo(mapCSVInter);
}
//crea datos para chartbubble rearDataSemivariograma(x,y,r)
function crearDataSemivariograma(x, y, r) {
    let dataArrBubble = [];
    dataArrBubble.push({ x: 0, y: 0, r: r });
    for (var i = 0; i < x.length; i++) {
        dataArrBubble.push({ x: x[i], y: y[i], r: r });
    }
    return dataArrBubble;
}
//funcion de error en el worker
function onError(e) {
    console.log('ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message)
    document.getElementById("imgLoading").style.display = "none";
    document.getElementById("interpolarCSV").style.display = "none";
    createVError(['ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message].join(''))
    //alert(['ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message].join(''))
}
//variograma Exponencial Teorico
function vt(nugget, sillPartial, rango, h,beta) {
    //return beta*(1.0 - Math.exp(-(1.0 / (1 / 3)) * h / rango))
    return nugget + sillPartial * (1.0 - Math.exp(-(1.0 / (1 / 3)) * h / rango))
}
//genera valores del variograma teorico que se ha ajustado 
function dataVT(nugget, sillPartial, rango,beta) {
    rango = rango + 200
    var x = []; //h
    var y = []; //variogramas teorico
    var cantP = 200
    var aument = rango / cantP;
    for (var i = 1; i < cantP + 1; i++) {
        y[i] = vt(nugget, sillPartial, rango, i * aument,beta);
        x[i] = i * aument;
    }
    return [y, x]
}
//funcion crea puntos para la grafica del variograma Experimental
function createDP(x, y) {
    var points = []
    for (var i = 0; i < x.length; i++) {
        points.push({ x: x[i], y: y[i], r: 5 })
    }
    return points
}

function crearMapaDeCalor(zona) {
    zonaCoord = zona[0].geometry.coordinates[0]
    console.log("1")  
    zonaCoord[0].forEach(function (point) {
        positions.push([point[1], point[0]]);
    });
    mapCSVInter.removeLayer(scope);
    scope = new L.polyline(positions, {
        color: 'blue'
    }).addTo(mapCSVInter);
    mapCSVInter.fitBounds(scope.getBounds());
    /**/
    var options = { units: 'meters' } //unidades con las que se trabaja metros
    var line = turf.lineString(inv(positions));
    var bbox = turf.bbox(line);
    var dcuadro = turf.distance([bbox[0], bbox[1]], [bbox[0], bbox[3]], options);
    var tamCuadro = Math.ceil(dcuadro / 150) //80
    var squareGrid = turf.squareGrid(bbox, tamCuadro, options);
    var cajaMulti = turf.bbox(squareGrid); //cuadro dlimitador del poligono 
    var puntos_a_interpolar=[];
    //propiedad centro de masa
    var centro; 
    var poligonoDeZona = turf.lineToPolygon(line);
    for (var i = 0; i < squareGrid.features.length; i++) { 
        centro=turf.centerOfMass(squareGrid.features[i]).geometry.coordinates; 
        puntos_a_interpolar.push([centro,turf.booleanWithin(turf.point(centro), poligonoDeZona )  ]) 
    } 
    //creamos el worker 
    const worker = new Worker('/interpoladoresjs/interpolacion.js');
    //manejamos los errores 
    worker.addEventListener('error', onError, false);
    //iniciamos el worker
    worker.postMessage({ ovi: ovitrampas, zona: zonaCoord, cajaMulti: cajaMulti, tamCuadro: tamCuadro,pi:puntos_a_interpolar});
    worker.onmessage = (event) => {
        console.log("Data:", event.data);
        var zi = event.data.zi;
        var mD = event.data.mD;
        //var Imoran = correlacio(mD, event.data.z)
        var h = event.data.h;
        var beta=event.data.beta//valor para solo cill parcial
        var nugget = event.data.nugget,
            rango = event.data.rango,
            sill = event.data.sill;

        var d = turf.distance([cajaMulti[0], cajaMulti[3]], [cajaMulti[2], cajaMulti[3]], {
            units: 'meters'
        });
        var d2 = turf.distance([cajaMulti[0], cajaMulti[1]], [cajaMulti[0], cajaMulti[3]], {
            units: 'meters'
        });
        var A = Math.ceil(d / tamCuadro)

        var B = Math.ceil(d2 / tamCuadro)
        if (B != zi.length / A) {
            B = zi.length / A;
            //console.log("!B")
        }
        let opacidad_img = 1;
        imgKrig = L.imageOverlay(creaImagen(A, B, zi, "canvasMap", ovitrampas), [
            [cajaMulti[1], cajaMulti[0]],
            [cajaMulti[3], cajaMulti[2]]
        ], {
            opacity: opacidad_img
        });
        //imgKrig.addTo(mapCSVInter);
        //console.log("squ:",squareGrid) 
        imgIDW = L.imageOverlay(creaImagen(A, B, event.data.zidw, "canvasMap", ovitrampas), [
            [cajaMulti[1], cajaMulti[0]],
            [cajaMulti[3], cajaMulti[2]]
        ], {
            opacity: opacidad_img
        });
        imgOpaci = imgKrig;
        //imgOpaci = imgIDW;
        document.getElementById("kriging").checked = true;
        imgOpaci.addTo(mapCSVInter);
        addTablaIndicador(ovitrampas);
        //agreagar datos al grafico de las semivarianzas
        document.getElementById("VARIO_TITLE").innerHTML = "Semivariograma | nugget:[" + nugget + " ], Rango:[ " + rango + " ], Sill:[" + sill + "]";
        //valores de semiva Teorico y lags
        var [dataSemivaTeorico, xVT] = dataVT(nugget, (sill - nugget), rango,beta);
        var dataP = createDP(h, event.data.semiva)
        chartVariograma.data.labels = xVT;
        chartVariograma.data.datasets[0].data = dataP;
        chartVariograma.data.datasets[1].data = dataSemivaTeorico;
        //chartVariograma.data.datasets[0].data=crearDataSemivariograma(h,event.data.semiva,5);
        chartVariograma.update();
        //finAgregar datos de  las semivarianzas
        document.getElementById("imgLoading").style.display = "none";
    }

}
//ocular / mostrar puntos
function ocultarPuntos() {
    groupCircleCSV.remove();
}

function mostrarPuntos() {
    groupCircleCSV.addTo(mapCSVInter);
}
//ocular / mostrar Marcadores
function addMarcadores() {
    groupMakersCSV.addTo(mapCSVInter)
}

function ocultarMarcadores() {
    groupMakersCSV.remove();
}
//redireccionar a Ventana de Mapa de calor
function ir_url(n, c_id, type_dat) { //value 
    document.getElementById("interpolarCSV").style.display = "";
    document.getElementById("imgLoading").style.display = "";
    document.getElementById('agregar-marcadoresCSV').addEventListener('click', function () {
        groupMakersCSV.addTo(mapCSVInter)
    })
    document.getElementById('remover-marcadoresCSV').addEventListener('click', function () {
        groupMakersCSV.remove();
    })

    //elimina la imagen si esta en el mapa
    if (mapCSVInter.hasLayer(imgOpaci)) { mapCSVInter.removeLayer(imgOpaci); }

    document.getElementById("imgLoading").style.display = ""; //muestra la imagen en mapCSVInter 
    //groupCirclesCSV.remove()
    document.getElementById("interpolarCSV").style.top = 0 + "%";
    document.getElementById("nomColInterp").innerHTML = "Colonia : " + n; //+paramsValue[0].zona;

    positions = [];
    ovitrampas = [];
    markersCSV = [];
    circlesCSV = [];


    console.log("c_id::", c_id, n);
    for (var i = 0; i < _json.length; i++) {
        //if(paramsValue[0].zona_id===_json[i].gid){
        if (c_id === _json[i].gid) {
            ovitrampas.push(_json[i]);

        }
    }

    groupMakersCSV.remove(); //remueve
    groupCircleCSV.remove(); //remueve circulos de add
    for (var i = 0; i < ovitrampas.length; i++) {
        circlesCSV[i] = L.circle([ovitrampas[i].latitud, ovitrampas[i].longitud], 1, { fill: true, color: "red" });
        markersCSV[i] = L.marker([ovitrampas[i].latitud, ovitrampas[i].longitud], { color: "red", draggable: false, title: "Ovitrampa" + (i + 1) + ": Cantidad de Huevos : " + ovitrampas[i].cantidad_huevos });
        markersCSV[i].bindPopup("Ovitrampa" + (i + 1) + ": Cantidad de Huevos : " + ovitrampas[i].cantidad_huevos)
    }
    groupCircleCSV = L.layerGroup(circlesCSV);
    groupCircleCSV.addTo(mapCSVInter);
    groupMakersCSV = L.layerGroup(markersCSV);
    //groupMakersCSV.addTo(mapCSVInter);


    if (type_dat === "type_csv_no_zona") {
        zona = zonaGeneral; ///agrega las zonas al mapa  
        for (var i = 0; i < zonaGeneral.length; i++) {
            if (zonaGeneral[i].properties.gid === c_id) {
                zona = [zonaGeneral[i]]
                break;
            }
        }
        console.log("zona despues:", zona)
        crearMapaDeCalor(zona);
    } else {
        fetch("/getZona", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                gid: [c_id] //[paramsValue[0].zona_id]
            })
        })
            .then(res => res.json())
            .then(data => {
                zona = data.zona; ///agrega las zonas al mapa 
                console.log("zona despues:", zona);
                crearMapaDeCalor(zona);
            });
    }
};

function mapaCalor(n, id, f, type_dat) {
    
    console.log("mapaCalor(" + n + "," + id + "," + f + "," + type_dat + ")")
    if (type_dat === "type_bd") {
        console.log(n, id, f)
        window.open(window.location.origin + "/info?x=" + n + "&gid=" + id + "&fecha=" + f, 'popup', 'width=' + (screen.width - 100) + ', height=' + (screen.height - 100) + ', left=' + 10 + ', top=' + 10 + '');
    } else if (type_dat === "type_csv") {
        console.log(n, id, f);
        ir_url(n, id, "");
    } else if (type_dat === "type_csv_no_zona") {
        ir_url(n, id, "type_csv_no_zona");
    }
}


document.getElementById('mostrarIMG').addEventListener("click", function () {
    //layerGroup.addTo(map);
    imgOpaci.addTo(mapCSVInter);
})
document.getElementById('ocultarIMG').addEventListener("click", function () {
    //map.removeLayer(layerGroup)
    mapCSVInter.removeLayer(imgOpaci);
});
//funcion para cerrar la ventana del semivariograma
function closeVariograma() {
    document.getElementById("id_variograma").style.display = "none";
}

function showVariograma() {
    document.getElementById("id_variograma").style.display = "";
}