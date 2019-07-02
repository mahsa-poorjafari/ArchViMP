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

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();


        try
        {

            let dtX = null;
            let dtY = null;

            configEdgeStyle(graph, "#888");
            let dataTypes = document.getElementById("logical_data_l0_textual").getElementsByClassName("shared_struct")[0].getElementsByTagName("li");
            let nodeSize = {};
            for (let i = 0; i < dataTypes.length; i++) {
                let dtId = 'dT'+i;
                let dtText = dataTypes[i].getElementsByTagName("span")[0].innerHTML;
                let dtVarList = dataTypes[i].getElementsByTagName("lo");
                nodeSize = setNodeSize(dtText, 'dataType' );

                nodeStyle(graph, 'dataType');
                    if (i === 0){
                        dtX = 200;
                        dtY = 150;
                    }
                    else if (i !== 0 && dtVarList.length <= 4){
                        dtX += 500;
                    }
                    else if (i !== 0 && dtVarList.length > 4 && (i-1)%2 === 0){
                        dtX += 700;
                    }else{
                        dtY += 400;
                        dtX = 200;
                    }
                // stX += 200;
                let dtNode = graph.insertVertex(parent, dtId, dtText, dtX, dtY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                drawChild(graph, parent, dtNode, dtVarList, 'block', '0');
                // for (let j = 0; j < dtVarList.length; j++) {
                //     if (j !== 0 && ((j/8)% 1) === 0){
                //         varH += 100;
                //         varW = 20;
                //     }
                //     let varId = 'dT'+i+'_var'+ j;
                //     // sharedVarStyle(graph, varId);
                //     // Specify edges for each data type
                //
                //     nodeStyle(graph, 'variable');
                //     let v = graph.insertVertex(parent, varId, dtVarList[j].innerHTML, varW, varH, 100, 50, 'variable');
                //     // console.log(i);
                //
                //     graph.insertEdge(parent, null, '', v, dt, 'dashed=0;'+
                //     'endArrow=block;sourcePerimeterSpacing=0;startFill=0;endFill=0;');
                //     varX +=150;
                //     varY += 10;
                // }

            }

        }
        finally
        {
            // Updates the display
            graph.getModel().endUpdate();
        }
    }
};


