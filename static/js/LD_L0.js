document.addEventListener('DOMContentLoaded', function() {
    let graphContainer = document.getElementById('logical_data_l0_diagram');
    main(graphContainer);
});

function main(container){
    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported())
    {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else
    {
        // Disables the built-in context menu
        mxEvent.disableContextMenu(container);

        // Creates the graph inside the given container
        var graph = new mxGraph(container);
        //graph.setEnabled(false);


        // graph.getStylesheet().getDefaultEdgeStyle();

        // Enables rubberband selection
        new mxRubberband(graph);

        // Disables basic selection and cell handling
        // configureStylesheet(graph);

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        var parent = graph.getDefaultParent();
        graph.keepEdgesInBackground = true;

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();


        try
        {

            let dtX = 500;
            let dtY = 300;

            configEdgeStyle(graph, "#000");
            let dataTypes = document.getElementById("logical_data_l0_textual").getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");
            let nodeSize = {};
            // console.log(dataTypes);
            let benchmarkName = get_url_benchmark();
            let fileName = get_url_fileName();
            let ulrParam = [benchmarkName];
            ulrParam.push((benchmarkName === "UPLOADED" && fileName) ? fileName : null);
            for (let i = 0; i < dataTypes.length; i++) {
                let dtId = 'dT'+i;
                let dtFirstElement = dataTypes[i].firstElementChild;
                let dtText = dtFirstElement.innerHTML;
                // let dtText = dataTypes[i].getElementsByTagName("span")[0].innerHTML;
                let dtStList = dataTypes[i].getElementsByClassName("list_level1")[0].getElementsByClassName('li-list_level1');

                nodeSize = setNodeSize(dtText, 'dataType' );
                nodeStyle(graph, 'dataType');
                let dtNode = graph.insertVertex(parent, dtId, dtText, dtX, dtY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                // let dtStList = dataTypes[i].getElementsByClassName("list_level1")[0].getElementsByClassName('li-list_level1');
                dtY += 800;

                for(let j = 0; j < dtStList.length; j++){
                    let firstElement = dtStList[j].firstElementChild;
                    let stText = firstElement.innerHTML;
                    if (stText !== "variables" && stText !== "variables ") {
                        drawChildLD(graph, parent, dtNode, firstElement, 'open', '0', j, ulrParam);
                    }else{
                        let varList = dtStList[j].getElementsByClassName("list_level2")[0].getElementsByTagName("li");
                        drawChild(graph, parent, dtNode, varList, 'open', '0', 1 ,'variable');
                    }

                }


            }

        }
        finally
        {
            // Updates the display
            graph.getModel().endUpdate();
        }
    }
};


