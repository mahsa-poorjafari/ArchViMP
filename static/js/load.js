function startRead()
    {
        // obtain input element through DOM

        var file = document.getElementById('file').files[0];
        if(file)
        {
            getAsText(file);
        }
    }

    function getAsText(readFile)
    {
        var reader;
        try
        {
            reader = new FileReader();
        }catch(e)
        {
            document.getElementById('output').innerHTML =
                "Error: seems File API is not supported on your browser";
            return;
        }

        // Read file into memory as UTF-8
        reader.readAsText(readFile, "UTF-8");

        // Handle progress, success, and errors
        reader.onprogress = updateProgress;
        reader.onload = loaded;
        reader.onerror = errorHandler;
    }

    function updateProgress(evt)
    {
        if (evt.lengthComputable)
        {
            // evt.loaded and evt.total are ProgressEvent properties
            var loaded = (evt.loaded / evt.total);
            if (loaded < 1)
            {
                // Increase the prog bar length
                // style.width = (loaded * 200) + "px";
                document.getElementById("bar").style.width = (loaded*100) + "%";
            }
        }
    }

    function loaded(evt)
    {
        // Obtain the read file data
        var fileString = evt.target.result;
        document.getElementById('output').innerHTML = fileString;
        document.getElementById("bar").style.width = 100 + "%";
    }

    function errorHandler(evt)
    {
        if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR)
        {
            // The file could not be read
            document.getElementById('output').innerHTML = "Error reading file..."
        }
    }
