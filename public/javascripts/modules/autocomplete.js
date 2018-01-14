function autocomplete(input, latInput, lngInput) {
    if(!input) return; //skip this function if there is no input on the page!
    const dropdown = new google.maps.places.Autocomplete(input);
    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        lngInput.value = place.geometry.location.lng();
        latInput.value = place.geometry.location.lat();
    })

    // if someone hit enter on the address field, we dont want to submit the form. 
    input.on('keydown', (e) => {
        if(e.keyCode === 13) e.preventDefault();
    })
}

export default autocomplete;