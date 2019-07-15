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

    let ldL1Container = document.getElementById("logical_data_l1_dig");

    logicalDataLevel1(ldL1Container, txtInContainer, "R");

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
        let parent = graph.getDefaultParent();



        // Highlights the vertices when the mouse enters
        let highlight = new mxCellTracker(graph, '#337ab7');

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try {
            let lcX = 50;
            let lcY = 50;
            let logicalCompY = 50;

            configEdgeStyle(graph, "#000000");
            let eStyle = graph.getStylesheet().getDefaultEdgeStyle();
            eStyle['endSize'] = '5';
            let lcs = txt.getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");


            let nodeSize = {};
            for (let i = 0; i < lcs.length; i++) {
                let lcId = 'LC_' + op + '_' + i;
                let lcFirstElement = lcs[i].firstElementChild;
                let lcText = lcFirstElement.innerHTML;
                // console.log(lcText);
                nodeSize = setNodeSize(lcText, 'logicalData_' + op);

                let lcAccessList = lcs[i].getElementsByClassName("list_level1")[0].getElementsByClassName('logical_components');
                let lcList = lcAccessList[0].getElementsByClassName('list_level2')[0].getElementsByTagName('li');
                nodeStyle(graph,  nodeSize['nodeIdText']);
                lcY += 300;

                let ldNode = graph.insertVertex(parent, lcId, lcText, lcX, lcY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                let benchmarkName = get_url_benchmark();
                let fileName = get_url_fileName();
                let ulrParam = [benchmarkName];
                ulrParam.push((benchmarkName === "UPLOADED" && fileName) ? fileName : null);

                graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){
                    scrollToTop(1000);
				    let cell = evt.getProperty('cell');
				    if (cell['style'] === "logicalData_R_big" || cell['style'] === "logicalData_R"){
                        document.getElementById('lc_l1_dig').style.display = "block";
                    }
				    evt.consume();
                });
                // console.log("benchmarkName------------ " + ulrParam);
                drawLcForLd(graph, parent, ldNode, lcList, logicalCompY, op, ulrParam);
                logicalCompY += 200;

            }


        }finally{
            // Updates the display
            graph.getModel().endUpdate();
        }

    }
}


function logicalDataLevel1(container, txt, op) {
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
        let parent = graph.getDefaultParent();



        // Highlights the vertices when the mouse enters
        let highlight = new mxCellTracker(graph, '#337ab7');

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try {
            let lcX = 300;
            let lcY = 200;

            configEdgeStyle(graph, "#000000");

            let ldL2 = txt.getElementsByClassName('list_level0')[0].getElementsByClassName('li-list_level0');
            let nodeSize = {};
            for (let i = 0; i < ldL2.length; i++) {
                let lcId = 'LDL2_' + op + '_' + i;
                let lcFirstElement = ldL2[i].firstElementChild;
                let lcText = lcFirstElement.innerHTML;
                nodeSize = setNodeSize(lcText, 'logicalData_' + op);
                let lcAccessList = ldL2[i].getElementsByClassName("list_level1")[0].getElementsByClassName('group_members');
                let ldL2List = lcAccessList[0].getElementsByClassName('list_level2')[0].getElementsByTagName('li');
                nodeStyle(graph,  nodeSize['nodeIdText']);
                console.log(lcText +"   " + lcText.length + "  -  " + lcX +"--"+ lcY);
                if (i === 0){
                    lcX = 300;
                    lcY = 200;
                }else if (i === 0 && lcText.length > 20){
                    lcY = 400;
                }else if ((i+1)%2 === 0 && lcText.length > 20){
                    lcY += 700;
                    lcX += 400;
                }else if ((i+1)%2 === 0){
                    lcX = 300;
                    lcY += 400;
                }else {
                    lcX += 300;
                    lcY += 400;
                }
                let ldNode = graph.insertVertex(parent, lcId, lcText, lcX, lcY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                // lcY = (i === 0 && lcText.length > 20)? 400 : (lcText.length > 20) ? lcY + 700: 200;


                let benchmarkName = get_url_benchmark();
                let fileName = get_url_fileName();
                let ulrParam = [benchmarkName];
                ulrParam.push((benchmarkName === "UPLOADED" && fileName) ? fileName : null);

                drawTdForLd(graph, parent, ldNode, ldL2List, op, ulrParam)
            }
        }finally {
            graph.getModel().endUpdate();

        }
    }

}