function downloadJSON(json, filename) {
    var jsonFile;
    var downloadLink;

    // Retrieve JSON file from experiment
    jsonFile = new Blob([json], {type: "text/json"});

    // Download link
    downloadLink = document.createElement("a");

    // Retrieve File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(jsonFile);

    // Hide download link
    downloadLink.style.display = 'none';

    // Add link to the DOM
    document.body.appendChild(downloadLink);

    downloadLink.click();
}