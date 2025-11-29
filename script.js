function getFormInput() {
    var startCityInput = document.getElementById("myForm").elements.namedItem("startCityInput").value;
    var timeInput = document.getElementById("myForm").elements.namedItem("timeInput").value;

    return {startCityInput, timeInput};
}
