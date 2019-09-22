document.addEventListener('DOMContentLoaded', function() {
    let ldName = get_node_name();
    let benchmarkName = get_url_benchmark();
    let fileName = get_url_fileName();
    let ulrParam = [benchmarkName];
    ulrParam.push((benchmarkName === "UPLOADED" && fileName) ? fileName : null);
    let timeLineTextContainer = document.getElementById("time_line_text");
    let timeLineViewContainer = document.getElementById('time_line_diagram');
    mainViewTimeLine(timeLineViewContainer, timeLineTextContainer, ldName, ulrParam);
    if (ldName !== null){
        document.getElementById('tab03').style.display = 'block';
        document.getElementById('tab01').style.display = 'none';
        document.getElementById('for_tab01').classList.remove("is-active");
        document.getElementById('for_tab03').classList.add("is-active");
        let timeLineL2Container = document.getElementById('time_line_ldl2_diagram');
        timeLineL2(timeLineL2Container, timeLineTextContainer, ldName, ulrParam)
    }

});

function mainViewTimeLine(container, txt, ldName, ulrParam) {

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
            //let timeStamps = txt.getElementsByClassName("time_stamp");
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
                    // document.location = document.location+"&node="+cellValue;
                    window.location = "http://127.0.0.1:8000/time_line_view?node="+cellValue+"&b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
                }else if (cell['style'].includes("logicalData") && cell['id'].includes('dataStrcut')){
                    window.location = "http://127.0.0.1:8000/Logical_Data_L1?node="+cellValue+"&b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
                }
                evt.consume();
            });

        }finally{
            // Updates the display
            graph.getModel().endUpdate();
        }

    }
}

function timeLineL2(container, txt, ldName, ulrParam) {
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
        let clientWidth = document.getElementById('content').clientWidth;
        let clientHeight = document.getElementById('content').clientHeight;
        let gX = clientWidth/2-250;
        let gY = clientHeight/2;
        let varX = 0;
        let varY = 0;
        let gMemberPosition = [];
        let gVarNodeName = null;
        let gVarNodeType = null;
        let gVarNodeId = null;
        if (ldName !== null){
            let tsVarElements = document.getElementById(ldName);
            let tsGName = tsVarElements.firstElementChild.innerHTML.replace(/ /g,'');

            let nodeSize = setNodeSize(tsGName, 'logicalData');
            nodeStyle(graph, nodeSize['nodeIdText']);
            let tsGNode = graph.insertVertex(parent, null, tsGName, gX, gY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);

            let tsGVarList = tsVarElements.getElementsByClassName('g_members');
            for (let i = 0; i < tsGVarList.length; i++){
                let gVar = tsGVarList[i];
                let gVarName = gVar.getElementsByClassName('key')[0].innerHTML.replace(/ /g,'');
                if (gVarName.includes(".")){
                    gVarNodeType = "logicalData";
                    gVarNodeName = gVarName.split(".")[0];
                    gVarNodeId = "dataStrcut" +i;
                }else{
                    gVarNodeType =  "variable";
                    gVarNodeName = gVarName;
                    gVarNodeId = "variable" + i;
                }

                let gVarOpType = gVar.getElementsByClassName('val')[0].innerHTML.replace(/ /g,'');
                let gVarNodeTypeOfOp = "";
                switch (gVarOpType) {

                    case "Read":
                        gVarNodeTypeOfOp = gVarNodeType + "_R";
                        break;

                    case "Write":
                        gVarNodeTypeOfOp = gVarNodeType + "_W";
                        break;

                    case "Process":
                        gVarNodeTypeOfOp = gVarNodeType + "_P";
                        break;

                    default:
                        gVarNodeTypeOfOp = gVarNodeType;
                        break;
                }

                // Position group members
                gMemberPosition = setPositionLDL2(gX, gY, i);
                nodeSize = setNodeSize(gVarNodeName, gVarNodeTypeOfOp);
                nodeStyle(graph,  nodeSize['nodeIdText']);
                let gVarNode = graph.insertVertex(parent, gVarNodeId, gVarNodeName, gMemberPosition[0], gMemberPosition[1], nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                // let edgeValue = tsGName + "_" + gVarOpType + "_" + gVarNodeName;
                let edgeValue = gVarOpType;
                switch (gVarOpType) {
                   case "Read":
                       graph.insertEdge(parent, null, edgeValue, gVarNode, tsGNode, 'dashed=0;endArrow=classic;sourcePerimeterSpacing=0;startFill=0;endFill=1;');
                       gVarNode.target = tsGNode;
                       tsGNode.source = gVarNode;
                       break;
                   case "Process":
                       graph.insertEdge(parent, null, edgeValue, tsGNode, gVarNode, 'dashed=0;endArrow=classic;startArrow=classic;sourcePerimeterSpacing=0;startFill=1;endFill=1;');
                       gVarNode.target = tsGNode;
                       gVarNode.source = tsGNode;
                       tsGNode.target = gVarNode;
                       tsGNode.source = gVarNode;
                       break;
                   case "Write":
                       graph.insertEdge(parent, null, edgeValue, tsGNode, gVarNode, 'dashed=0;endArrow=classic;sourcePerimeterSpacing=0;startFill=0;endFill=1;');
                       gVarNode.source = tsGNode;
                       tsGNode.target = gVarNode;
                       break;
                }

            }

        }else{
            document.getElementById('tsGroupEmpty').style.display = 'block';
        }
        graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){
            let cell = evt.getProperty('cell');
            let cellValue = cell['value'].replace(/ /g,'');
            if (cell['style'].includes("logicalData") && cell['id'].includes('dataStrcut')){
                window.location = "http://127.0.0.1:8000/Logical_Data_L1?node="+cellValue+"&b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
            }
            evt.consume();
        });

    }finally{
        // Updates the display
        graph.getModel().endUpdate();
    }

}



