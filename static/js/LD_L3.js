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

    let ldL1InputContainer = document.getElementById("logical_data_l1_input_dig");
    logicalDataLevel1(ldL1InputContainer, txtInContainer, "R");

    let ldL1OutputContainer = document.getElementById("logical_data_l1_output_dig");
    logicalDataLevel1(ldL1OutputContainer, txtOutContainer, "W");

    let ldL1ProcessContainer = document.getElementById("logical_data_l1_process_dig");
    logicalDataLevel1(ldL1ProcessContainer, txtPContainer, "P");

    let graphOpGroupContainer = document.getElementById("logical_data_l3_all_dig");
    let allL3GroupContainer = document.getElementById("all_logical_data_l3_dig");
    let ldL2Container = document.getElementById("logical_data_l2_all_dig");
    let txtOpContiner = document.getElementById("logical_component_l1_holder");
    allOperations(graphOpGroupContainer, txtOpContiner, txtInContainer, txtOutContainer, txtPContainer);
    // allLogicalDataLevel1(ldL2Container, txtInContainer, txtOutContainer, txtPContainer );
    showAllL3GroupContainer(allL3GroupContainer, txtInContainer, txtOutContainer, txtPContainer );

});


function allOperations(container, txt, InContainer, OutContainer, PContainer) {
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
;
        // Enables rubberband selection
        new mxRubberband(graph);

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        let parent = graph.getDefaultParent();
        configEdgeStyle(graph, "#000000");
        let eStyle = graph.getStylesheet().getDefaultEdgeStyle();
        eStyle['endSize'] = '5';
        graph.keepEdgesInBackground = true;
        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();

        try {
            let nodeSize = {};
            let lcX = 600;
            let lcY = 100;
            let ldInX = 100;
            let ldInY = 400;
            let ldOutX = 1200;
            let ldOutY = 200;
            let ldPX = 800;
            let ldPY = 300;
            let benchmarkName = get_url_benchmark();
            let fileName = get_url_fileName();
            let ulrParam = [benchmarkName];
            ulrParam.push((benchmarkName === "UPLOADED" && fileName) ? fileName : null);


            let inputGroup = InContainer.getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");
            let processGroup = PContainer.getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");
            let outputGroup = OutContainer.getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");

            let threadsListContainer = txt.getElementsByClassName("thr_func");
            let threadsList = [];
            for (let i=0; i< threadsListContainer.length; i++){
                let lcId = 'LC_' + i;
                let logicalComp = threadsListContainer[i].getElementsByTagName("li")[0].innerText;
                threadsList.push(logicalComp);
                nodeSize = setNodeSize(logicalComp, 'LogicalComp');
                nodeStyle(graph,  nodeSize['nodeIdText']);
                let mxCells =  graph.getChildVertices(graph.getDefaultParent());
                let nodeCounter = 0;
                mxCells.forEach(function (node) {
                    if (node['value'] === logicalComp)
                        nodeCounter++;
                });
                if (nodeCounter === 0){
                    graph.insertVertex(parent, lcId, logicalComp, lcX, lcY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                    lcY += 300;
                }
                graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){
                    let cell = evt.getProperty('cell');
                    if (cell['style'].includes("LogicalComp")){
                        window.location = "http://127.0.0.1:8000/logical_comp?node="+cell['value']+"&b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
                    }
                    evt.consume();
                });
            }
            let listOfTechnicalData = [];
            let listOfShareVars = document.getElementById('shared_vars_holder').getElementsByClassName('shared_var_list')[0];
            let listOfLogicalData = listOfShareVars.getElementsByClassName('li-list_level2');
            for (let ld of listOfLogicalData){
                if (ld.firstElementChild.innerHTML === 'variables'){
                    listOfTechnicalData = ld.getElementsByClassName('list_level1')[0].getElementsByClassName('li-list_level0');
                }
            }

            if ( listOfLogicalData.length > 9 || listOfTechnicalData.length > 9 ) {
                // Draw Input groups
                connect_LD_to_related_LC(graph, parent, inputGroup, ldInX, ldInY, "R");

                // Draw Process groups
                connect_LD_to_related_LC(graph, parent, processGroup, ldPX, ldPY, "P");

                // Draw Output groups
                connect_LD_to_related_LC(graph, parent, outputGroup, ldOutX, ldOutY, "W");
            }else{
                let tdX = 10;
                let tdY = 200;
                for (let td of listOfTechnicalData){
                    let tdText = td.innerHTML.replace(/ /g,'');
                    nodeSize = setNodeSize(tdText,  'variable');
                    nodeStyle(graph,  nodeSize['nodeIdText']);
                    graph.insertVertex(parent, null, tdText, tdX, tdY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                    tdY += 400;
                }
                let inputTds = document.getElementById('thread_var_input');
                let processTds = document.getElementById('thread_var_process');
                let outputTds = document.getElementById('thread_var_output');
                connect_TD_to_related_LC(graph, parent, inputTds, "R");
                connect_TD_to_related_LC(graph, parent, processTds, "P");
                connect_TD_to_related_LC(graph, parent, outputTds, "W");
            }

        }finally{
            // Updates the display
            graph.getModel().endUpdate();
        }

    }

    
}

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
        graph.keepEdgesInBackground = true;
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
                let gray_menu = "";
                graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){
                    scrollToTop(1000);
                    let cell = evt.getProperty('cell');

                    // if (cell['style'] === "logicalData_R_big" || cell['style'] === "logicalData_R"){
                    //     document.getElementById("lc_l1_dig_input").style.display = "block";
                    // }
                    switch (cell['style']) {
                        case "logicalData_R_big":
                        case "logicalData_R":
                            document.getElementById("lc_l1_dig_input").style.display = "block";
                            break;
                        case "logicalData_W_big":
                        case "logicalData_W":
                            document.getElementById("lc_l1_dig_output").style.display = "block";
                            break;
                        case "logicalData_P":
                        case "logicalData_P_big":
                            document.getElementById("lc_l1_dig_process").style.display = "block";
                            break;
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


function allLogicalDataLevel1(container, InContainer, OutContainer, PContainer) {
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
        // Enables rubberband selection
        new mxRubberband(graph);

        // Disables basic selection and cell handling
        // configureStylesheet(graph);

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        let parent = graph.getDefaultParent();
        graph.keepEdgesInBackground = true;
        // Highlights the vertices when the mouse enters
        let highlight = new mxCellTracker(graph, '#337ab7');

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try {
            let varX = 500;
            let varY = 50;
            let nodeSize = {};
            let benchmarkName = get_url_benchmark();
            let fileName = get_url_fileName();
            let ulrParam = [benchmarkName];
            ulrParam.push((benchmarkName === "UPLOADED" && fileName) ? fileName : null);
            configEdgeStyle(graph, "#000000");
            let childList = document.getElementById("shared_vars_holder").getElementsByClassName("shared_var_list")[0].getElementsByClassName("li-list_level2");

            for (let v of childList){
                let vText = v.firstElementChild.innerHTML.replace(/(\r\n)/g,'');

                if (vText !== "variables"){
                    nodeSize = setNodeSize(vText, 'logicalData');
                    nodeStyle(graph,  nodeSize['nodeIdText']);
                    graph.insertVertex(parent, null, vText, varX, varY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                    graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){
                        let cell = evt.getProperty('cell');
                        if (cell['style'].includes("logicalData")){
                            window.location = "http://127.0.0.1:8000/Logical_Data_L1?node="+cell['value']+"&b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
                        }
                        evt.consume();
                    });
                    varY += 200;
                }else{
                    let sharedVarList = v.getElementsByClassName('list_level1')[0].getElementsByClassName('li-list_level0');
                    for (let tD of sharedVarList){
                        let tDText = tD.innerText;
                        nodeSize = setNodeSize(vText, 'variable');
                        nodeStyle(graph,  nodeSize['nodeIdText']);
                        graph.insertVertex(parent, null, tDText, varX, varY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                        varY += 200;
                    }
                }
                // varY += 200;
            }

            getLdL1AllVars(InContainer, "R", graph, parent, 10, 200);
            getLdL1AllVars(PContainer, "P", graph, parent, 900, 400);
            getLdL1AllVars(OutContainer, "W", graph, parent, 1200, 100);

        }finally {
            graph.getModel().endUpdate();
        }
    }

}

function showAllL3GroupContainer(container, InContainer, OutContainer, PContainer) {
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
        // Enables rubberband selection
        new mxRubberband(graph);

        // Disables basic selection and cell handling
        // configureStylesheet(graph);

        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        let parent = graph.getDefaultParent();
        graph.keepEdgesInBackground = true;
        // Highlights the vertices when the mouse enters
        let highlight = new mxCellTracker(graph, '#337ab7');

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try {
            let benchmarkName = get_url_benchmark();
            let fileName = get_url_fileName();
            let ulrParam = [benchmarkName];

            ulrParam.push((benchmarkName === "UPLOADED" && fileName) ? fileName : null);
            configEdgeStyle(graph, "#000000");

            showLdL3(InContainer, "R",graph, parent, 50, 50);
            showLdL3(PContainer, "P",graph, parent, 500, 50);
            showLdL3(OutContainer, "W",graph, parent, 900, 50);

        }finally {
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
        graph.keepEdgesInBackground = true;
        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        try {
            let lcX = null;
            let lcY = null;
            configEdgeStyle(graph, "#000000");

            let ldL2 = txt.getElementsByClassName('list_level0')[0].getElementsByClassName('li-list_level0');
            let nodeSize = {};
            for (let i = 0; i < ldL2.length; i++) {
                let lcId = 'LDL2_' + op + '_' + i;
                let lcFirstElement = ldL2[i].firstElementChild;
                let lcText = lcFirstElement.innerHTML;
                // console.log("ZZZZZZZZZZ   " + lcText);
                nodeSize = setNodeSize(lcText, 'logicalData_' + op);
                let lcAccessList = ldL2[i].getElementsByClassName("list_level1")[0].getElementsByClassName('group_members');
                let ldL2List = lcAccessList[0].getElementsByClassName('list_level2')[0].getElementsByTagName('li');
                // console.log(ldL2List.length);
                nodeStyle(graph,  nodeSize['nodeIdText']);
                // positioning the op_group logical data
                if (i === 0 && lcText.length > 20){
                    // console.log("reached i===0 && >20");
                    lcX = 400;
                    lcY = 400;
                }else if (i === 0 ){
                    // console.log("reached i===0");
                    lcX = 300;
                    lcY = 250;
                }else if ( lcText.length > 20 && ldL2List.length > 20){
                    // console.log("(i+1)%2 === 0 and >20");
                    lcY += 800;
                    lcX = 600;
                }else if (lcText.length > 20 && ldL2List.length <= 20){
                    // console.log("(i+1)%2 === 0 ");
                    lcX = 300;
                    lcY += 600;
                }else {
                    // console.log("reached else");
                    lcX = 300;
                    lcY += 600;
                }
                // console.log(lcText +"   " + lcText.length + "  -  " + lcX +"--"+ lcY + "--i--" + i);
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