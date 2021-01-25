function borrarPelicula(id){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            location.reload();
        }
    };
    xhttp.open("DELETE", "/listadoPeliculas/pelicula/"+id, true);
    xhttp.send();
}