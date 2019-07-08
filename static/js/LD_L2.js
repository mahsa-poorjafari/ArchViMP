document.addEventListener('DOMContentLoaded', function() {
    let graphInGroupContainer = document.getElementById('logical_data_l2_dig_input');
    let txtInContainer = document.getElementById("logical_data_l2_txt_input");
    mainGrouped(graphInGroupContainer, txtInContainer, "R");

    let txtOutContainer = document.getElementById("logical_data_l2_txt_output");
    let graphOutGroupContainer = document.getElementById('logical_data_l2_dig_output');
    mainGrouped(graphOutGroupContainer, txtOutContainer, "W");

    let txtPContainer = document.getElementById("logical_data_l2_txt_process");
    let graphPGroupContainer = document.getElementById('logical_data_l2_dig_process');
    mainGrouped(graphPGroupContainer, txtPContainer, "P");

});


function mainGrouped(container, txt, op) {
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
        try {
            console.log("---mainGrouped-----");
            let lcX = 50;
            let lcY = 50;

            configEdgeStyle(graph, "#000000");
            let eStyle = graph.getStylesheet().getDefaultEdgeStyle();
            eStyle['endSize'] = '5';
            let lcs = txt.getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");


            let nodeSize = {};
            for (let i = 0; i < lcs.length; i++) {
                let lcId = 'LC_' + op + '_' + i;
                let lcFirstElement = lcs[i].firstElementChild;
                let lcText = lcFirstElement.innerHTML;
                console.log(lcText);
                nodeSize = setNodeSize(lcText, 'logicalData_' + op);

                let lcAccessList = lcs[i].getElementsByClassName("list_level1")[0].getElementsByClassName('logical_components');
                let lcList = lcAccessList[0].getElementsByClassName('list_level2')[0].getElementsByTagName('li');
                nodeStyle(graph,  nodeSize['nodeIdText']);
                lcY += 300;

                let ldNode = graph.insertVertex(parent, lcId, lcText, lcX, lcY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);

                drawLcForLd(graph, parent, ldNode, lcList, op)

            }


        }finally{
            // Updates the display
            graph.getModel().endUpdate();
        }

    }
}


