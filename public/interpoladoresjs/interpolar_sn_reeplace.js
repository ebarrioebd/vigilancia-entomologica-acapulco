//interpolador IDW
function Zi(centro, puntos, exp) {
    var d = 0;
    var s1 = 0// new Array();
    var s2 = 0// new Array();
    for (var i = 0; i < puntos.length; i++) { 
        d=Math.sqrt(Math.pow(parseFloat(puntos[i].longitud) - centro[0], 2) + Math.pow(parseFloat(puntos[i].latitud)- centro[1], 2));//turf.distance([puntos[i].longitud,puntos[i].latitud], centro, { units: 'meters' });
        s1 += puntos[i].cantidad_huevos / Math.pow(d, exp)
        s2 += 1 / Math.pow(d, exp)
    }
    return s1 / s2
}

//invertir MAtriz
var Sylvester = {}
Sylvester.Matrix = function() {}
Sylvester.Matrix.create = function(elements) {
    var M = new Sylvester.Matrix()
    return M.setElements(elements)
}
Sylvester.Matrix.I = function(n) {
    var els = [],
        i = n,
        j
    while (i--) {
        j = n
        els[i] = []
        while (j--) {
            els[i][j] = i === j ? 1 : 0
        }
    }
    return Sylvester.Matrix.create(els)
}
Sylvester.Matrix.prototype = {
    dup: function() {
        return Sylvester.Matrix.create(this.elements)
    },

    isSquare: function() {
        var cols = this.elements.length === 0 ? 0 : this.elements[0].length
        return this.elements.length === cols
    },

    toRightTriangular: function() {
        if (this.elements.length === 0) return Sylvester.Matrix.create([])
        var M = this.dup(),
            els
        var n = this.elements.length,
            i,
            j,
            np = this.elements[0].length,
            p
        for (i = 0; i < n; i++) {
            if (M.elements[i][i] === 0) {
                for (j = i + 1; j < n; j++) {
                    if (M.elements[j][i] !== 0) {
                        els = []
                        for (p = 0; p < np; p++) {
                            els.push(M.elements[i][p] + M.elements[j][p])
                        }
                        M.elements[i] = els
                        break
                    }
                }
            }
            if (M.elements[i][i] !== 0) {
                for (j = i + 1; j < n; j++) {
                    var multiplier = M.elements[j][i] / M.elements[i][i]
                    els = []
                    for (p = 0; p < np; p++) {
                        // Elements with column numbers up to an including the number of the
                        // row that we're subtracting can safely be set straight to zero,
                        // since that's the point of this routine and it avoids having to
                        // loop over and correct rounding errors later
                        els.push(
                            p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier
                        )
                    }
                    M.elements[j] = els
                }
            }
        }
        return M
    },

    determinant: function() {
        if (this.elements.length === 0) {
            return 1
        }
        if (!this.isSquare()) {
            return null
        }
        var M = this.toRightTriangular()
        var det = M.elements[0][0],
            n = M.elements.length
        for (var i = 1; i < n; i++) {
            det = det * M.elements[i][i]
        }
        return det
    },

    isSingular: function() {
        return this.isSquare() && this.determinant() === 0
    },

    augment: function(matrix) {
        if (this.elements.length === 0) {
            return this.dup()
        }
        var M = matrix.elements || matrix
        if (typeof M[0][0] === 'undefined') {
            M = Sylvester.Matrix.create(M).elements
        }
        var T = this.dup(),
            cols = T.elements[0].length
        var i = T.elements.length,
            nj = M[0].length,
            j
        if (i !== M.length) {
            return null
        }
        while (i--) {
            j = nj
            while (j--) {
                T.elements[i][cols + j] = M[i][j]
            }
        }
        return T
    },

    inverse: function() {
        if (this.elements.length === 0) {
            return null
        }
        if (!this.isSquare() || this.isSingular()) {
            return null
        }
        var n = this.elements.length,
            i = n,
            j
        var M = this.augment(Sylvester.Matrix.I(n)).toRightTriangular()
        var np = M.elements[0].length,
            p,
            els,
            divisor
        var inverse_elements = [],
            new_element
        // Sylvester.Matrix is non-singular so there will be no zeros on the
        // diagonal. Cycle through rows from last to first.
        while (i--) {
            // First, normalise diagonal elements to 1
            els = []
            inverse_elements[i] = []
            divisor = M.elements[i][i]
            for (p = 0; p < np; p++) {
                new_element = M.elements[i][p] / divisor
                els.push(new_element)
                // Shuffle off the current row of the right hand side into the results
                // array as it will not be modified by later runs through this loop
                if (p >= n) {
                    inverse_elements[i].push(new_element)
                }
            }
            M.elements[i] = els
            // Then, subtract this row from those above it to give the identity matrix
            // on the left hand side
            j = i
            while (j--) {
                els = []
                for (p = 0; p < np; p++) {
                    els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i])
                }
                M.elements[j] = els
            }
        }
        return Sylvester.Matrix.create(inverse_elements)
    },

    setElements: function(els) {
        var i,
            j,
            elements = els.elements || els
        if (elements[0] && typeof elements[0][0] !== 'undefined') {
            i = elements.length
            this.elements = []
            while (i--) {
                j = elements[i].length
                this.elements[i] = []
                while (j--) {
                    this.elements[i][j] = elements[i][j]
                }
            }
            return this
        }
        var n = elements.length
        this.elements = []
        for (i = 0; i < n; i++) {
            this.elements.push([elements[i]])
        }
        return this
    },
}

function invM(elements) {
    const mat = Sylvester.Matrix.create(elements).inverse()
    if (mat !== null) {
        return mat.elements
    } else {
        return null
    }
}

/////fin de invertir matriz
function c(o, b) {
    console.log(o, b);
}
//import { inv } from 'mathjs'

function transpose(matrix) {
    const rows = matrix.length,
        cols = matrix[0].length;
    const grid = [];
    for (let j = 0; j < cols; j++) {
        grid[j] = Array(rows);
    }
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            grid[j][i] = matrix[i][j];
        }
    }
    return grid;
}

function mult(a, b) {
    var aNumRows = a.length,
        aNumCols = a[0].length,
        bNumRows = b.length,
        bNumCols = b[0].length,
        m = new Array(aNumRows); // initialize array of rows
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols); // initialize the current row
        for (var c = 0; c < bNumCols; ++c) {
            m[r][c] = 0; // initialize the current cell
            for (var i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
} 
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


function getVariograma(x, y, z) { 
    var nugget=0;
    var rango=0;
    var sill=0;

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
    //variograma.mD=mDistancias;
    //console.log("MD:",mDistancias);
    dist.sort((a, b) => { return a - b }) //oredena  los valores de las distancia menor-mayor
    rango = dist[dist.length - 1]//toma la distancia mas larga para obtener el rango
    //console.log("rango:.",dist)
    //console.log("dist.length::"+dist.length)
    //indica la cantidad de intervalos
    var lags = (dist.length) > 30 ? 30 : (dist.length) / 2; //si dist.length>30 toma 30 si es < entoces la mitad que equivale a 
    //console.log("lags:::"+lags)
    var tolerance = rango / lags;//la tolerancia crea un intervalo para buscar los pares
    //console.log("tolerance::"+tolerance)
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
    rango = Math.max.apply(null, lagsemi) - lagsemi[0]; //
    //variograma.lags = lagsemi;
    //variograma.semi = semiva;
    //Ajuste por minimos cuadrados ordinarios
    var Y = semiva;
    var X = Array(Y.length).fill().map(() => Array(2).fill(1)); 
    //var A = variograma.A;
    //funcion exponencial
    //genera valores del variogrma teorico
    for (var i = 0; i < Y.length; i++) {
        X[i][1] = 1.0 - Math.exp(-(1.0 / (1/3)) * lagsemi[i] / rango); // 1.0 - Math.exp(-(1.0 / A) * lagsemi[i] /rango );
    }
    c("X:", X)
    //se ajusta el variograma teorico
    var Xt = transpose(X) // math.transpose(X)
    c("1")
    var XtX = mult(Xt, X) //math.multiply(Xt, X) 
    var XtXinv = invM(XtX); 
    c("2")
    var xinvxt = mult(XtXinv, Xt) 
    var ny = Y.length;
    var ya = Array(ny).fill().map(() => Array(ny).fill(0));
    for (var i = 0; i < ny; i++) {
        ya[i] = [Y[i]];
    } 
    c("3")
    var W = mult(xinvxt, ya) //math.multiply(math.multiply(XtXinv, Xt), Y)  //valores que minimizan el error
    //var Z = math.multiply(MXt, MX)
    //math.inv(MZ)
    nugget =  W[0]// > 0 ? W[0]: 0;
    console.log("nugget:"+nugget)
    sill = parseFloat(W[1]) + parseFloat(nugget);
    //variograma.w0 = W[0];
    var sill_partial=W[1];
    //variograma.w1 = W[1];
    //c("Nugget:", nugget)
    //c("sill:", sill)
    //variograma.n = x.length;
    var n = x.length;
    //conseguir la Matriz del Variograma Teorico de los puntos de la muestra
    var mvt = Array(n+1).fill(1).map(() => Array(n+1).fill(1));
    console.log("MVT=",mvt)
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            mvt[i][j] =  W[0][0] + W[1][0] * (1.0 - Math.exp(-(1.0 / (1/3)) * ( Math.sqrt(Math.pow(x[j] - x[i], 2) + Math.pow(y[j] - y[i], 2))*100000/ rango)))
        }
        z[i]=[z[i]]
    } 
     mvt[n][n]=0;
    var matriz_variograma_teorico=invM(mvt)
    console.log("MVT=",matriz_variograma_teorico)

    return {nugget:nugget,mvt:matriz_variograma_teorico,sill:sill,rango:rango,lags:lagsemi,semi:semiva,mD:mDistancias,C1:sill_partial}
};
function estimar(lat, long, variograma,x,y,z) { 
    //c(lat,long)
    var _Y = [];
    for (var i = 0; i < x.length; i++) {
        _Y[i] = [variograma.nugget[0] + variograma.C1[0]* (1.0 - Math.exp(-(1.0 / (1/3)) * ((Math.pow(Math.pow(lat - x[i], 2) + Math.pow(long - y[i], 2), 0.5))*100000 / variograma.rango)))];
     }
     _Y[x.length]=[1]
    //c("_Y",_Y)
     //calulor de los pesos y el parametro de lagrange
    var pesos = mult(variograma.mvt,_Y)//math.multiply(variograma.K, math.transpose(_Y));
    pesos= pesos.slice(0, x.length); 
    return mult(transpose(pesos),z)

}

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
        x.push(parseFloat(inf_ovi[i].longitud));
        y.push(parseFloat(inf_ovi[i].latitud));
    }
    var variograma = getVariograma(x, y, z);
    console.log(variograma);
    console.time("estimar")
    var k = 0,
        zi = [],zidw = []; 
    var x_c = 0;//centro punto x
    var y_c = 0;//centro punto y
    console.log("init:",x_c, y_c, variograma,x,y,z)
    for (var i = 0; i < squareGrid.features.length; i++) {
        x_c = squareGrid.features[i].properties.centro[0];
        y_c = squareGrid.features[i].properties.centro[1];
        if (zona[0].pip(x_c, y_c)) {
            //squareGrid.features[i].properties.cant = estimar(x, y, variograma);
            zi[k] = estimar(x_c, y_c, variograma,x,y,z); // metodo Kriging
            zidw[k] = Zi([x_c, y_c], inf_ovi, 2.5);//metodo idw
        } else {
            zi[k] = -1;
            zidw[k] = -1;
        }
        k++;
    }
    console.timeEnd("estimar")
    postMessage({zi:zi,zidw:zidw,h:variograma.lags,semiva:variograma.semi,nugget:parseInt(variograma.nugget[0]),rango:parseInt(variograma.rango),sill:parseInt(variograma.sill),mD:variograma.mD,z:z});
}, false);
/*

//z=[91,73,76,76,70,83,88,90,69,101]

console.log("Variograma:", variograma);*/