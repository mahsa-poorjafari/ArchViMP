document.addEventListener('DOMContentLoaded', function() {
    let ldName = get_node_name();
    let timeLineTextContainer = document.getElementById("time_line_text");
    if (ldName !== null){
        document.getElementById('tab03').style.display = 'block';
        document.getElementById('tab01').style.display = 'none';
        document.getElementById('for_tab01').classList.remove("is-active");
        document.getElementById('for_tab03').classList.add("is-active");
        let timeLineL2Container = document.getElementById('time_line_ldl2_diagram');
        timeLineL2(timeLineL2Container, timeLineTextContainer, ldName)
    }
    let timeLineViewContainer = document.getElementById('time_line_diagram');

    mainViewTimeLine(timeLineViewContainer, timeLineTextContainer);
});

function mainViewTimeLine(container, txt, ldName) {

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
            let timeStamps = txt.getElementsByClassName("time_stamp");
            let lcs = txt.getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");

            let lcNode = null;
            let lcW = 10;
            let lcY = 5;
            for (let i = 0; i < lcs.length; i++) {
                let lcId = 'LC_' + i;
                let lcFirstElement = lcs[i].firstElementChild;
                let lcText = lcFirstElement.innerHTML;
                let childW = null;
                if (lcText.includes("_")){
                    lcText = lcText.replace(/_/g, "\n");
                    nodeStyle(graph, "mainThread");
                    lcNode = graph.insertVertex(parent, lcId, lcText, lcW, lcY, 100, 60, 'mainThread');
                }else {
                    nodeStyle(graph, "thread");
                    lcNode = graph.insertVertex(parent, lcId, lcText, lcW, lcY, 100, 60, 'thread');
                    childW = lcW;
                }
                lcW += 150;
                let sharedVarsAccess =  lcs[i].getElementsByClassName('list_level1')[0].getElementsByClassName('li-list_level1');
                //console.log(sharedVarsAccess);
                for (let accessList of sharedVarsAccess){
                    // let accessTime = accessList.firstElementChild.innerHTML.replace(/_/g, "\n");
                    let accessTime = accessList.getElementsByClassName('time_stamp')[0].innerHTML.replace(/ /g,'');
                    let accessVars = accessList.getElementsByClassName('list_level2')[0].getElementsByClassName('li-list_level2');

                    drawChildTimeLine(accessVars, accessTime, graph, parent, childW)
                }
            }
            graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){
                let cell = evt.getProperty('cell');
                let cellValue = cell['value'].replace(/ /g,'');
                if (cell['style'].includes("logicalData") && cellValue.includes(':')){
                    document.location = document.location+"&node="+cellValue;
                }else if (cellValue.includes('logicalDecision') || cell['id'].includes('function_ld_')){
                    //document.location = ldUrlPath+"?b=" +ulrParam[0] + "&node=" + cellValue;
                }
                evt.consume();
            });

        }finally{
            // Updates the display
            graph.getModel().endUpdate();
        }

    }
}

function timeLineL2(container, txt, ldName) {
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
        for (let tsGroup of txt){
            
        }

    }finally{
        // Updates the display
        graph.getModel().endUpdate();
    }

}



