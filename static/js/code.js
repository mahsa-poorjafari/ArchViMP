let cy = window.cy = cytoscape({
  container: document.getElementById('cy'),

  boxSelectionEnabled: true,
  zoomingEnabled: false,
  userZoomingEnabled: false,

  style: [
    {
      selector: "node",
      "style" : {
        "content": "data(id)",
        "text-valign": "center",
        "text-halign": "center",
        "width": 70,
        "height": 70,
        "shape": "data(type)",
        'background-color': '#ccc',
        'color':'#000',
        'font-size': 10,
        "text-wrap":"wrap"
      }
    }, {
      "selector": "edge",
      "style": {
        "width": 2,
        "curve-style": "bezier",
        "target-arrow-shape": "triangle"
      }
    }, {
      "selector": "edge[arrow]",
      "style": {
        "target-arrow-shape": "triangle"
      }
    }, {
      "selector": "edge.hollow",
      "style": {
        "target-arrow-fill": "hollow"
      }

    }
  ],

  elements: {
    nodes: nodeList,
    edges: edgeList
        //[
      // {"data": {"id": "e9", "source": "n16", "target": "n17", "arrow": "diamond"}},
    //]
  }

});
cy.edges().toggleClass('hollow');

// let funcList = [];
// //let conList = [];
// let funcNames = document.getElementById('function_names').getElementsByTagName("li");
// for (let i = 0; i < funcNames.length; i++) {
//   let a = {"data": {"id": funcNames[i].innerHTML}};
//   funcList.push(a);
// }
// let dl = window.dl = cytoscape({
//   container: document.getElementById('dl'),
//   boxSelectionEnabled: true,
//   zoomingEnabled: false,
//   userZoomingEnabled: false,
//   style: [
//     {
//       selector: "node",
//       "style" : {
//         "content": "data(id)",
//         "text-valign": "center",
//         "text-halign": "center",
//         "width": 70,
//         "height": 70,
//         "shape": "rectangle",
//         'background-color': '#FFD700',
//         'color':'#000',
//         'font-size': 10,
//         "text-wrap":"wrap"
//       }
//     }, {
//       "selector": "edge",
//       "style": {
//         "width": 2,
//         "curve-style": "bezier",
//         "target-arrow-shape": "diamond"
//       }
//     }, {
//       "selector": "edge[arrow]",
//       "style": {
//         "target-arrow-shape": "diamond"
//       }
//     }, {
//       "selector": "edge.hollow",
//       "style": {
//         "target-arrow-fill": "hollow"
//       }
//
//     }
//   ],
//
//   elements: {
//     nodes: funcList,
//     // edges: edgeList
//         //[
//       // {"data": {"id": "e9", "source": "n16", "target": "n17", "arrow": "diamond"}},
//     //]
//   }
// });