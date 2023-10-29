document.getElementById("convertToCSV").addEventListener("click", function() {
    const manaBoxInput = document.getElementById("manaBoxInput").value;
    // Implement the conversion logic from Mana Box to CSV here
    const csvOutput = convertManaBoxToCSV(manaBoxInput);
    updateOutput("csv", csvOutput);
});

document.getElementById("convertToManaBox").addEventListener("click", function() {
    const csvInput = document.getElementById("csvInput").value;
    // Implement the conversion logic from CSV to Mana Box here
    const manaBoxOutput = convertCSVToManaBox(csvInput);
    updateOutput("manabox", manaBoxOutput);
});

document.getElementById("shareDeck").addEventListener("click", function() {
    const deckData = document.getElementById("output").value;
    const outputFormat = document.getElementById("outputFormat").value;
    const u = encodeAndShareDeck(outputFormat, deckData);
    // copy to clipboard
    navigator.clipboard.writeText(u);
    alert("Copied to clipboard!");
});

document.getElementById('manaBoxFileInput').addEventListener('change', function(event) {
    handleFileSelect("manabox", event.target.files[0]);
});

document.getElementById('csvFileInput').addEventListener('change', function(event) {
    handleFileSelect("csv", event.target.files[0]);
});

function handleFileSelect(format, file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        if (format == "manabox") {
            document.getElementById("manaBoxInput").value = event.target.result;
        } 
        if (format == "csv") {
            document.getElementById("csvInput").value = event.target.result;
        }
    };
    reader.readAsText(file);
}

window.onload = function() {
    const format = decodeDeckFromURL();
    updateShare(format);
}

function updateOutput(format, output) {
    document.getElementById("output").value = output;
    document.getElementById("outputFormat").value = format;
    updateShare(format)
}

function updateShare(format) {
    const button = document.getElementById("shareDeck");
    const deckData = document.getElementById("output").value;
    if (!deckData) {
        button.href = "";
        button.disabled = true;
        return;
    }

    button.href = encodeAndShareDeck(format, deckData);
    button.disabled = false;
}

// Implement the conversion functions (convertManaBoxToCSV and convertCSVToManaBox) here
function convertManaBoxToCSV(manaBoxInput) {
    const lines = manaBoxInput.split('\n');
    const csvOutput = lines.filter(line => !!line)
        .map(line => {
            const [count, ...name] = line.trim().split(' ');
            return `${count},"${name.join(" ")}",,`;
        }).join('\n');
    return csvOutput;
}

function convertCSVToManaBox(csvInput) {
    const lines = csvInput.split('\n');
    const manaBoxOutput = lines.map(line => {
        const values = [];

        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else if (char === '"') {
                inQuotes = !inQuotes;
            } else {
                current += char;
            }
        }

        values.push(current.trim());

        const [count, name, ..._] = values;
        // parse count as integer and skip if non-int
        if (isNaN(parseInt(count))) {
            return '';
        }
        return `${count} ${name}`;
    }).filter(line => !!line).join('\n');
    return manaBoxOutput;
}

// Encode the deck data and set it as the URL parameter
function encodeAndShareDeck(format, deckData) {
    const encodedData = encodeURIComponent(deckData);
    const url = `${window.location.toString()}?format=${format}&deck=${encodedData}`;
    return url;
}

// Decode the deck data from the URL parameter
function decodeDeckFromURL() {
    const queryParams = new URLSearchParams(window.location.search);
    const format = queryParams.get("format");
    const deckData = queryParams.get("deck");
    if (deckData) {
        // Handle the decoded deck data and populate the input fields
        if (format == "manabox") {
            document.getElementById("manaBoxInput").value = deckData;
        }
        if (format == "csv") {
            document.getElementById("csvInput").value = deckData;
        }
    }

    return format;
}