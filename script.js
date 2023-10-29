window.addEventListener('load', function() {
    const deck = decodeDeckFromURL();
    if (deck && deck.deckData) {
        document.getElementById("input").value = deck.deckData;
        setSelectedFormat(deck.format);
    }
});

document.getElementById("convert").addEventListener("click", function() {
    const input = document.getElementById("input").value;
    const inputFormat = getSelectedFormat();
    switch (inputFormat) {
    case "csv":
        const manaBoxOutput = convertCSVToManaBox(input);
        updateOutput("manabox", manaBoxOutput);
        break;
    case "manabox":
        const csvOutput = convertManaBoxToCSV(input);
        updateOutput("csv", csvOutput);
        break;
    default:
        alert("Invalid input format");
        break;
    }
});

document.getElementById("copyDeck").addEventListener("click", function() {
    const deckData = document.getElementById("output").value;
    copyToClipboard(deckData);
});

document.getElementById("shareDeck").addEventListener("click", function() {
    const deckData = document.getElementById("output").value;
    const outputFormat = document.getElementById("outputFormat").value;
    const u = encodeAndShareDeck(outputFormat, deckData);
    // copy to clipboard
    copyToClipboard(u);
    alert("Copied link to clipboard!");
});

document.getElementById('fileInput').addEventListener('change', function(event) {
    handleFileSelect(event.target.files[0]);
});

document.getElementsByName("inputFormat").forEach(input => {
    input.addEventListener("change", function() {
        document.getElementById("convert").disabled = false;
    });
})

function copyToClipboard(data) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(data);
    } else {
        const el = document.createElement('textarea');
        el.value = data;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }
}

function getSelectedFormat() {
    const format = Array.from(document.getElementsByName("inputFormat")).filter(input => input.checked);
    if (!!format) {
        return format[0].value;
    }
    
    return null;
}

function setSelectedFormat(format) {
    const input = Array.from(document.getElementsByName("inputFormat")).filter(input => input.value === format);
    console.log(input)
    if (!!input) {
        input[0].checked = true;
        document.getElementById("convert").disabled = false;
    }
}

function handleFileSelect(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        console.log("File loaded")
        document.getElementById("input").value = event.target.result;
    };
    reader.readAsText(file);
}

function updateOutput(format, output) {
    document.getElementById("output").value = output;
    document.getElementById("outputFormat").value = format;
    updateShareAndCopy(format)
}

function updateShareAndCopy(format) {
    const share = document.getElementById("shareDeck");
    const copy = document.getElementById("copyDeck");
    const deckData = document.getElementById("output").value;
    if (!deckData) {
        share.href = "";
        share.disabled = true;
        copy.disabled = true;
        return;
    }

    share.href = encodeAndShareDeck(format, deckData);
    share.disabled = false;
    copy.disabled = false;
}

// Implement the conversion functions (convertManaBoxToCSV and convertCSVToManaBox) here
function convertManaBoxToCSV(manaBoxInput) {
    const lines = manaBoxInput.split('\n');
    const csvOutput = lines.filter(line => !!line && line.split(' ').length > 1)
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
    const queryparams = new URLSearchParams(window.location.search);
    queryparams.set("format", format);
    queryparams.set("deck", encodedData);
    const url = `${window.location.href}?${queryparams.toString()}`;
    return url;
}

// Decode the deck data from the URL parameter
function decodeDeckFromURL() {
    const queryParams = new URLSearchParams(window.location.search);
    const format = queryParams.get("format");
    const deckData = queryParams.get("deck");

    return !!format && !!deckData 
        ? { format: decodeURIComponent(format), deckData: decodeURIComponent(deckData) } 
        : null;
}