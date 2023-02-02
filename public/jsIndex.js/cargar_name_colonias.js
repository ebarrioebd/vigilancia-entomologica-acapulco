//Comienza carga para los nombres de las zonas 
console.log("cargar_name_colonias.js")
getNomCol() //!{JSON.stringify(zonasT)}
function getNomCol() {
    return fetch("/map", {
            method: 'POST', // or 'PUT'
            body: JSON.stringify({}), // data can be `string` or {object}!
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(response => addNameHTML(response));
}

function addNameHTML(title_zonas) {
    var selecZonadiv = '';
    var cheker = "";
    for (var i = 0; i < title_zonas.length; i++) {
        if (title_zonas[i].gid == "25670" || title_zonas[i].gid == "25688" || title_zonas[i].gid == "25692" || title_zonas[i].gid == "25714" || title_zonas[i].gid == "25572" || title_zonas[i].gid == "25413" || title_zonas[i].gid == "26982" || title_zonas[i].gid == "26407" || title_zonas[i].gid == "26596" || title_zonas[i].gid == "25636" || title_zonas[i].gid == "25670" || title_zonas[i].gid == "25692" || title_zonas[i].gid == "25536") {
            //if(title_zonas[i].gid=="25413" || title_zonas[i].gid=="25536"){ 
            cheker = "checked";
        } else {
            cheker = ""
        }
        selecZonadiv += `
    <div class="row"> 
    <div class="col-2" style="    padding-top: 4px;" >
    <input class="cbSelectAllCol" type="checkbox" ${cheker} value='["${title_zonas[i].nombre_colonia}",${title_zonas[i].gid}]'id="">
    </div>
    <div class="col-9" style="padding: 0">
    <select id="${title_zonas[i].gid}" >
        <option> ${title_zonas[i].nombre_colonia}</option>
        <optgroup style="display:none" id="optgroup" label="Geostadisticos">
            <option value='[{"option":"interpolacion","zona":"${title_zonas[i].nombre_colonia}","zona_id":"${title_zonas[i].gid}"}]' id="option"><a href="">- Interpolación</a></option>
        </optgroup>
        <optgroup style="display:none" id="optgroup" label="Estadisticos">
            <option value='[{"option":"descriptivo","zona":"${title_zonas[i].nombre_colonia}","zona_id":"${title_zonas[i].gid}"}]' id="option">- Descriptios</option>
        </optgroup>
    </select>
    </div>
    </div>
    <br>
    `
    }
    document.getElementById("Lzonas").innerHTML = selecZonadiv;
} //fin addNameHTML Cargar nombres de la colonias
