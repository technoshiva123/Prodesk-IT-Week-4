function updateFileName() {
    const file = document.getElementById('resumeUpload').files[0];
    if (file) {
        document.getElementById('fileName').innerText = file.name;
        document.getElementById('fileName').classList.add('text-blue-600');
    }
}

async function generateLetter() {
    const name = document.getElementById('name').value;
    const company = document.getElementById('company').value;
    const role = document.getElementById('role').value;
    const skills = document.getElementById('skills').value;
    const resumeFile = document.getElementById('resumeUpload').files[0];

    const btn = document.getElementById('gen-btn');
    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('spinner');

    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');
    const resultSection = document.getElementById('result-section');
    const output = document.getElementById('letter-output');

    if (!name || !company || !role || !skills) {
        alert("Please fill all fields! ✨");
        return;
    }

    btn.disabled = true;
    btnText.innerText = "Processing Data...";
    spinner.classList.remove('hidden');

    emptyState.classList.add('hidden');
    resultSection.classList.add('hidden');
    loadingState.classList.remove('hidden');

    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('company', company);
        formData.append('role', role);
        formData.append('skills', skills);
        if (resumeFile) {
            formData.append('resume', resumeFile);
        }

        const response = await fetch('/generate', {
        method: 'POST',
        body: formData 
        });

        const data = await response.json();

        if (response.ok && data.text) {
            output.innerText = data.text;
            loadingState.classList.add('hidden');
            resultSection.classList.remove('hidden');
        } else {
            throw new Error(data.error || "AI Generation Failed");
        }

    } catch (err) {
        console.error("Error:", err);
        alert("Server Error: " + err.message);

        loadingState.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btnText.innerText = "Generate with AI";
        spinner.classList.add('hidden');
    }
}

function copyToClipboard() {
    const output = document.getElementById('letter-output');
    const text = output.innerText;

    if (!text) {
        alert("Generate a letter first!");
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        alert("Cover letter copied to clipboard! 📋");
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}
