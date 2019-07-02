document.addEventListener('DOMContentLoaded', function() {
    let graphContainer = document.getElementById('catastrophe_diagram');
    main(graphContainer);
    function main(container)
    {
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


            // graph.getStylesheet().getDefaultEdgeStyle()['edgeStyle'] = 'topToBottomEdgeStyle';
            graph.htmlLabels = true;
            graph.vertexLabelsMovable = true;

            graph.isWrapping = function (cell) {
                return this.model.isCollapsed(cell);
            };


            // Enables rubberband selection
            new mxRubberband(graph);
            let parent = graph.getDefaultParent();

            // Adds cells to the model in a single step
            graph.getModel().beginUpdate();
            try
            {
                let varH = 50;
                let varW = 10;
                let thrW = 20;
                let thrH = 700;
                let edgeColor = "#ccc";
                configEdgeStyle(graph, edgeColor);

                let varList = document.getElementById('var_list').getElementsByClassName('set_var_id');
                // console.log(varList.length);
                let varThrList = document.getElementById("sidebar").getElementsByClassName("threads");
                let thrList = varThrList[0].getElementsByTagName("li");
                for (let j = 0; j < thrList.length; j++) {
                    let thrId = 'thr'+j;

                    nodeStyle(graph, "thread");
                    let thread = thrList[j].innerHTML;
                    graph.insertVertex(parent, thrId, thread, thrW, thrH, 150, 100, "thread");
                    thrW += 200;
                    //thrH -= 50;
                }
                //  addThreadNodes(graph, parent, thrList, 20, 100);
                let thrCells = graph.getChildVertices(graph.getDefaultParent());
                //console.table(thrCells);

                // graph.insertVertex(parent, null, "get Elements By Tag Name getElements ByTagName", varW, varH, 120, 100, "val_10");

                for (let i = 0; i < varList.length; i++) {
                    let varText = varList[i].getElementsByTagName("span")[0].innerHTML;
                    // console.log("i => " + (i == 0 || i < varList.length/2));
                    if (i == 0){
                        varH = 50;
                        varW = 10;
                    }
                    else if (i !== 0 && i < varList.length/2){
                        varW +=150;
                        let varH_cal = thrH - (60 * i);
                        varH = thrH < (60 * i) ? varH_cal * -1 : varH_cal;
                        if (((i/8)% 1) === 0){
                            varH -= 100;
                            varW = 10;
                        }
                        console.log(varText + " - "+ varH);
                    }else{
                        //varH += 400;
                        varW +=150;
                        varH = thrH + (20 * i);
                        if (((i/8)% 1) === 0){
                            varH += 100;
                            varW = 10;
                        }
                    }
                    // if (i !== 0 && ((i/8)% 1) === 0){
                    //     varH += 100;
                    //     varW = 20;
                    // }
                    let varId = 'val_' + i;
                    //varW +=150;
                    //varH += 10;

                    let varThrList = varList[i].getElementsByTagName("ol")[0];

                    nodeStyle(graph, "variable");
                    let varNode = graph.insertVertex(parent, varId, varText, varW, varH, 120, 100, "variable");


                    thrCells.forEach(function (t) {
                        // console.log(t);
                        graph.insertEdge(parent, null, null, t, varNode, 'dashed=0;'+
                             'endArrow=open;startFill=0;endFill=0;' +
                             'endSize=8;');
                    });
                    //varW +=150;
                    //varH += 10;
                    thrW += 200;
                }
                // console.table(graph.getStylesheet().getDefaultVertexStyle());
            }
            finally
            {
                // Updates the display
                graph.getModel().endUpdate();
            }

        }


    };

});