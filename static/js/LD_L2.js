document.addEventListener('DOMContentLoaded', function() {
    let graphContainer = document.getElementById('logical_data_l2_diagram');
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
            let threads = document.getElementById("logical_data_l0_textual").getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");
            let nodeSize = {};
            // console.log(dataTypes);

        }
        finally
        {
            // Updates the display
            graph.getModel().endUpdate();
        }



    }
}