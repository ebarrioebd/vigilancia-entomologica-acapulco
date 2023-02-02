
importScripts('../mathjs/math.min.js'); 

//interpolador IDW

Array.prototype.pip = function(x, y) {
    var i, j, c = false;
    for (i = 0, j = this.length - 1; i < this.length; j = i++) {
        if (((this[i][1] > y) != (this[j][1] > y)) &&
            (x < (this[j][0] - this[i][0]) * (y - this[i][1]) / (this[j][1] - this[i][1]) + this[i][0])) {
            c = !c;
        }
    }
    return c;
}
function Zi(centro, puntos, exp) {
    var d = 0;
    var s1 = 0;
    var s2 = 0;
    for (var i = 0; i < puntos.length; i++) { 
        d=Math.sqrt(Math.pow(parseFloat(puntos[i].longitud) - centro[0], 2) + Math.pow(parseFloat(puntos[i].latitud)- centro[1], 2));//turf.distance([puntos[i].longitud,puntos[i].latitud], centro, { units: 'meters' });
        s1 += puntos[i].cantidad_huevos / Math.pow(d, exp)
        s2 += 1 / Math.pow(d, exp)
    }
    return s1 / s2
}
 
function c(o, b) {
    console.log(o, b);
}
function estimar(lat, long, variograma) { 
    var _Y = [];
    for (var i = 0; i < variograma.n; i++) {
        _Y[i] = [variograma.nugget[0] + variograma.w1[0]* (1.0 - Math.exp(-(1.0 / variograma.A) * ((Math.pow(Math.pow(lat - variograma.x[i], 2) + Math.pow(long - variograma.y[i], 2), 0.5))*100000 / variograma.rango)))];
    } 
    var pesos = math.multiply(variograma.K,_Y)//math.multiply(variograma.K, math.transpose(_Y)); 
    return math.multiply(math.transpose(pesos),variograma.z)
}

function getVariograma(x, y, z) { 
    var variograma = {
        x: x,
        y: y,
        z: z,
        nugget: 0,
        rango: 0,
        sill:0,
        A: 1 / 3
    }
    var mDistancias = [];
    var mValores = []
    var dist = [];
    //Calcular matriz de distancias y de diferencias
    //mV=abs(zi-zj) = |Zi - Zj| donde Zi,Zj son valores en el punto P[i] y P[j] o Coor[i]=[lat,long], Coor[j]=[lat,long], Z(Pi = [x=lat,y=long])=zi
    //mD=distancia entre todos los puntos
    for (var i = 0; i < z.length; i++) {
        mDistancias[i] = [];
        mValores[i] = [];
        for (var j = 0; j < z.length; j++) {
            mValores[i][j] =Math.abs(z[i] - z[j]);
            //mValores[i][j] = Math.pow(z[i]-z[j],2)//Math.abs(z[i] - z[j]);//valores de las diferencias de la semivarianza
            mDistancias[i][j] = Math.sqrt(Math.pow(x[i] - x[j], 2) + Math.pow(y[i] - y[j], 2))*100000 //distancias de entre cada punto
            //turf.distance
            //mDistancias[i][j] = turf.distance([x[i], y[i]], [x[j], y[j]], units);
            if (i != j)
                dist.push(mDistancias[i][j]); //todas las distancias que nos son el mismo punto !== 0
        }
    }
    
    variograma.mD=mDistancias;
    console.log("MD:",mDistancias);
    console.log("mv:",mValores)
    dist.sort((a, b) => { return a - b }) //oredena  los valores de las distancia menor-mayor
    variograma.rango = dist[dist.length - 1]//toma la distancia mas larga para obtener el rango
    console.log("dist:.",dist)
    console.log("dist.length::"+dist.length)
    //indica la cantidad de intervalos
    var lags = (dist.length) > 30 ? 30 : (dist.length) / 2; //si dist.length>30 toma 30 si es < entoces la mitad que equivale a 
    //console.log("lags:::"+lags)
    var tolerance = variograma.rango / lags;//la tolerancia crea un intervalo para buscar los pares
    console.log("tolerance::"+tolerance)
    var lag = []
    var semi = []
    var par = []
    var semiva = [];
    var lagsemi = []
    for (var k = 0; k < lags; k++) {
        par[k] = 0;
        lag[k] = 0
        semi[k] = 0
        //lagsemi[k] = 0
        //semiva[k] = 0
    }

    for (var i = 0; i < mDistancias.length; i++) {
        for (var j = 0; j < mDistancias.length; j++) {
            for (var k = 0; k < lags; k++) {
                //si mDis(xi,xj) estan en [ Dis(xi,xj) , Dis(xi,xj) + Tolerancia ] ==> [D,D+T]
                //Recorre cada intervalo y verifica que alguno de esos puntos esten dentro de algun intervalo  
                if (mDistancias[i][j] > (k) * tolerance & mDistancias[i][j] <= (k + 1) * tolerance) {
                    //if (parseInt(atan2([x[i], y[i]], [x[j], y[j]])) > 0 & parseInt(atan2([x[i], y[i]], [x[j], y[j]])) <= 90) {
                    lag[k] += mDistancias[i][j];//se suman las distancia de cada par, asi despues promeidarlas
                    semi[k] += mValores[i][j];//se suman los mValores en el intervalo de los puntos que estan en el intervalo de busqueda de los pares
                    par[k] += 1;//se agregan los pares encontrados dentro del intervalo, cada par encontrado aumnta en uno
                    //}
                }
            }
        }
    }
    console.log("par:", par)
    console.log("Semi:",semi)
    console.log("lag:",lag)
    for (var k = 0; k < lags; k++) {
        if (par[k] != 0) {
            lag[k] /= par[k] //promedia las distancia a la que encuetra los pares para obtener los lags
            semi[k] /= (2*par[k])//par[k] //se divide los la dif de los valores entre los números de pares encontrado en el intervalo segun la formula del variograma
        }
    }
    console.log("SEmivarianza....")
    for (var k = 0; k < lags; k++) {
        if (lag[k] > 0 & semi[k] > 0) {
            //se agregan los lags de distancias a lagsemi
            lagsemi.push(lag[k])
            //se agregan las varianzas a semiva
            semiva.push(semi[k])
        }
    } 
    //console.log("lagsemi[l]-lagsemi[0]::",Math.max.apply(null, lagsemi),lagsemi[0])
    //el rango se obtiene al restar el lags maximo menos el minimo
    variograma.rango = Math.max.apply(null, lagsemi) - lagsemi[0]; //
    variograma.lags = lagsemi;
    variograma.semi = semiva;
    //Ajuste por minimos cuadrados ordinarios
    var Y = semiva;
    var X = Array(Y.length).fill().map(() => Array(2).fill(1)); 
    var A = variograma.A;
    //funcion exponencial
    //genera valores del variogrma teorico
    for (var i = 0; i < Y.length; i++) {
        X[i][1] = 1.0 - Math.exp(-(1.0 / A) * lagsemi[i] / variograma.rango); // 1.0 - Math.exp(-(1.0 / A) * lagsemi[i] /variograma.rango );
    }
    c("X:", X)
    //se ajusta el variograma teorico
    var Xt = math.transpose(X) // math.transpose(X)  
    var XtX = math.multiply(Xt, X) //math.multiply(Xt, X)  
    var XtXinv = math.inv(XtX); 
    var xinvxt = math.multiply(XtXinv, Xt) 
    var ny = Y.length;
    var ya = Array(ny).fill().map(() => Array(ny).fill(0));
    for (var i = 0; i < ny; i++) {
        ya[i] = [Y[i]];
    } 
    var W = math.multiply(xinvxt, ya) //math.multiply(math.multiply(XtXinv, Xt), Y)  //valores que minimizan el error
   
    variograma.nugget = W[0];
    variograma.sill = parseFloat(W[1]) + parseFloat(variograma.nugget);
    variograma.w0 = W[0];//nugget
    variograma.w1 = W[1];//sill parcial
    variograma.n = x.length;//longtud de valores
    var n = x.length;
    //conseguir la Matriz del Variograma Teorico de los puntos de la muestra
    var K = Array(n).fill().map(() => Array(n).fill(0));
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            K[i][j] =  W[0][0] + W[1][0] * (1.0 - Math.exp(-(1.0 / A) * ( Math.sqrt(Math.pow(x[j] - x[i], 2) + Math.pow(y[j] - y[i], 2))*100000/ variograma.rango)))
        }
        z[i]=[z[i]]
    } 
    variograma.K = math.inv(K) 
    //variograma.K = invM(K) //math.inv(K); //matriz inversa de los valores del variograma teorico y^-1(xi-xj) xi=[lat,long] 
    return variograma; 
};
self.addEventListener('message', function(e) { 
    var inf_ovi = e.data.ovi; 
    var zona = e.data.zona; 
    var squareGrid = e.data.squareGrid;
    var cajaMulti = e.data.cajaMulti;
    var tamCuadro = e.data.tamCuadro;
    var x = []
    var y = []
    var z = []
    for (var i = 0; i < inf_ovi.length; i++) {
        //ovitrampas.push(inf_ovi[i])
        z.push(inf_ovi[i].cantidad_huevos);
        x.push(inf_ovi[i].longitud);
        y.push(inf_ovi[i].latitud);
    }
    var variograma = getVariograma(x, y, z);
    console.log(variograma);
    console.time("estimar")
    var k = 0,
        zi = [],zidw = []; 
    for (var i = 0; i < squareGrid.features.length; i++) {
        x = squareGrid.features[i].properties.centro[0];
        y = squareGrid.features[i].properties.centro[1];
        if (zona[0].pip(x, y)) {
            //squareGrid.features[i].properties.cant = estimar(x, y, variograma);
            zi[k] = estimar(x, y, variograma); // metodo Kriging
            zidw[k] = Zi([x, y], inf_ovi, 2.5);//metodo idw
        } else {
            zi[k] = -1;
            zidw[k] = -1;
        }
        k++;
    }
    console.timeEnd("estimar")
    //semivariograma.nugget[0]+" ], Rango:[ "+semivariograma.rango+" ], Sill:["+semivariograma.sill+"]";
    postMessage({zi:zi,zidw:zidw,h:variograma.lags,semiva:variograma.semi,nugget:parseInt(variograma.nugget[0]),rango:parseInt(variograma.rango),sill:parseInt(variograma.sill),mD:variograma.mD,z:z});
}, false);