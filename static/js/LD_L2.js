document.addEventListener('DOMContentLoaded', function() {
    let graphContainer = document.getElementById('logical_data_l2_diagram');
    let graphGContainer = document.getElementById('logical_data_l2_Grouped');
    main(graphContainer);
    mainGrouped(graphGContainer);
});


function mainGrouped() {
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


        }finally{
            // Updates the display
            graph.getModel().endUpdate();
        }

    }
}


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

            let lcX = 600;
            let lcY = 50;

            configEdgeStyle(graph, "#000000");
            let eStyle = graph.getStylesheet().getDefaultEdgeStyle();
            eStyle['endSize'] = '5';
            let lcs = document.getElementById("logical_data_l2_textual").getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");
            let nodeSize = {};
            for (let i = 0; i < lcs.length; i++) {
                let lcId = 'LC' + i;
                let lcFirstElement = lcs[i].firstElementChild;
                let lcText = lcFirstElement.innerHTML;

                let lcAccessList = lcs[i].getElementsByClassName("list_level1")[0].getElementsByClassName('li-list_level1');

                nodeSize = setNodeSize(lcText, 'LogicalComp');
                nodeStyle(graph, 'LogicalComp');
                lcY += 300;

                let lcNode = graph.insertVertex(parent, lcId, lcText, lcX, lcY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                // let stText = varList;
                drawChildThrOP(graph, parent, lcNode, lcAccessList);

            }

        }
        finally
        {
            // Updates the display
            graph.getModel().endUpdate();
        }

    }
}