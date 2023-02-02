console.log("Indicadores.js")
/*let markers = []//new Array(); 
var groupMakers = L.layerGroup(markers); 
*/
//agrega marcadores al mapa(map)
function addOvi(ovi_i) {
    markers = []
    groupMakers.remove();
    var _i = 0;
    for (var j = 0; j < ovi_i.length; j++) {
        for (var i = 0; i < ovi_i[j].length; i++) {
            if (!isNaN(ovi_i[j][i].latitud) && !isNaN(ovi_i[j][i].longitud)) {
                markers[_i] = L.marker([ovi_i[j][i].latitud, ovi_i[j][i].longitud], { color: "red", draggable: false, title: "" + ovi_i[j][i].cantidad_huevos });
                markers[_i].bindPopup("<b>Colonia</b> : " + ovi_i[j][i].nom_col + " <b>cant :</b> <var>" + ovi_i[j][i].cantidad_huevos + "</var>")
                _i++; //index markers
            }
        }
        //}
    }
    groupMakers = L.layerGroup(markers);
}

function graphPromedioHoy(a) { //agrega los datos a la grafia de promedios de hoy para cada zona
    var iGDay = {
        promedios: [],
        nom_col: [],
    }
    for (var i = 0; i < a.length; i++) {
        iGDay.promedios.push(a[i].ph);
        iGDay.nom_col.push(a[i].nom_col)
    }
    if (iGDay.promedios.length > 10) {
        c_pm.options.scales.x.display = false;
    } else {
        c_pm.options.scales.x.display = true;
    }
    c_pm.data.labels = iGDay.nom_col;
    c_pm.data.datasets[0].data = iGDay.promedios;
    c_pm.data.datasets[0].backgroundColor = gradient
    c_pm.update();
}

function addZonaName(id, l, p, c, c_h) {
    //l=nombre dcolonia[]
    //p=numeros de ovitrampa[]
    //c=color[]
    //c_h=cantidad de huevos[]
    var doc_ = "";
    for (var i = 0; i < l.length; i++) {
        doc_ += '<tr><td id="td_color" style="background:' + c[i] + ' ;color:black; width: 2px;" >' + p[i] + '</td><td style="text-align: initial">' + l[i] + '</td><td>' + parseInt(c_h[i]) + '</td></tr>';
    }
    document.getElementById(id).innerHTML = '<table style="width:100%"><thead><th>#Ovit</th><th>Colonia</th> <th>#Huevos</th></thead><tbody>' + doc_ + '<tbody></table>';
}
//funcion fin
function generarNumero(numero) {
    return (Math.random() * numero).toFixed(0);
}
var _PH = [] //indices de recipientes
function colorRGB() {
    var coolor = "(" + generarNumero(255) + "," + generarNumero(255) + "," + generarNumero(255) + ")";
    return "rgb" + coolor;
}

function groupOvi(arr) {
    //console.log("arr",arr)
    let a = [
        []
    ]
    let k = 0;
    for (var i = 0; i < arr.length; i++) {
        if (i > 0 && arr[i]['gid'] !== arr[i - 1]['gid']) {
            a.push([])
            k++;
        }
        a[k].push(arr[i]);

    }
    return a;
}
var colorsL = [] //color de cada labels 
//generar indicadores entomologicos
async function indicadores(inf_ovi, _zona, type_dat) {
    console.log("TypeDat:" + type_dat)
    console.log("inf_ovi::",inf_ovi)
    _zona = [];
    _PH = [] //Promedio de Huevos
    let c_pop = { //val para chart porcentaje de ovitrampa positiva
        nom_col: [], //save nombre de las colonias
        pop: [],
        gid: []
    }
    let sum_cant; //cantidad de huevos
    let cant_ovi = 0; //cuenta las ovitrampas
    let n_c = [] //almacena la cantidad de huevo de cada colonia
    let p_n_c = [] //almacena el porcentaje de huevos del total de las colonias
    let t_huevos = 0; //total de huevos
    let cant_ovi_colonia = [];
    let cant_t_ovi = 0; //variable para almacenar el total de oivitrampas
    for (var j = 0; j < inf_ovi.length; j++) {
        cant_ovi += inf_ovi[j].length;
        sum_cant = 0;
        if (inf_ovi[j].length > 0) { // ooption ::  && !isNaN(parseInt(inf_ovi[j][0]["gid"]))
            cant_ovi_colonia.push(inf_ovi[j].length);
            cant_t_ovi = inf_ovi[j].length;
            for (var i = 0; i < inf_ovi[j].length; i++) {
                if (!isNaN(inf_ovi[j][i].cantidad_huevos)) {
                    t_huevos += inf_ovi[j][i].cantidad_huevos;
                    sum_cant += inf_ovi[j][i].cantidad_huevos;
                }
                if (inf_ovi[j][i].cantidad_huevos < 10 || isNaN(inf_ovi[j][i].cantidad_huevos)) {
                    cant_t_ovi -= 1;
                }
            }
            c_pop.nom_col.push(inf_ovi[j][0].nom_col);
            c_pop.gid.push(inf_ovi[j][0].gid);
            c_pop.pop.push(parseInt((cant_t_ovi * 100) / inf_ovi[j].length))
            n_c.push(sum_cant)
            _zona.push(inf_ovi[j][0].gid);
            colorsL.push(colorRGB());
            cant_t_ovi = 0;
            _PH.push({ ph: sum_cant / (inf_ovi[j].length), sumaH: sum_cant, nom_col: inf_ovi[j][0].nom_col, fecha: inf_ovi[j][0].fecha, cant_ovi: inf_ovi[j].length });
        } else {
            console.log("gid:" + inf_ovi[j][0]["gid"] + " is " + isNaN(parseInt(inf_ovi[j][0]["gid"])), inf_ovi[j].length)
        }
        //
    } 

    //var aux_suma = 0
    for (var i = 0; i < inf_ovi.length; i++) {
        p_n_c[i] = ((n_c[i] * 100) / t_huevos).toFixed(3)
        //aux_suma+=parseInt(p_n_c[i]);
    }
    //console.log("Porcentaje:", p_n_c, "Suma:", aux_suma)
    //dar valore a las siguientes varibles definidas como variables_G
    nombres_de_colonias=c_pop.nom_col;
    cantidad_h_de_cada_colonia=n_c;
    cantidad_ovi_de_cada_colonia=cant_ovi_colonia;
    gid_de_cada_colonnia=c_pop.gid;
    //
    document.getElementById("n_ovi").innerHTML = cant_ovi;
    myLineChart.data.datasets[0].data = p_n_c //ph;
    myLineChart.data.datasets[0].backgroundColor = colorsL; //color a la grafica
    myLineChart.data.labels = c_pop.nom_col; // Would update the first dataset's value of 'March' to be 50
    myLineChart.update();
    //graph_POP
    chart_pop.data.labels = c_pop.nom_col;
    chart_pop.data.datasets[0].data = c_pop.pop; 
    chart_pop.update();
    addZonaName("zona_name", c_pop.nom_col, cant_ovi_colonia, colorsL, n_c)
    graphPromedioHoy(_PH);
    console.log("Agregando zona..")
    console.log("AddZona::::", _zona)
    console.log("getZona()",c_pop)
    getZonas(_zona, c_pop, type_dat)
    console.log("Zonas agregadas..")
    addOvi(inf_ovi);
}
 