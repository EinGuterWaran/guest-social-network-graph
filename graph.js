document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('guestForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const guestListInput = document.getElementById('guestList').value;
    const guests = guestListInput.split(',').map(guest => ({ name: guest.trim() }));
    createGraph(guests);
  });

  // Set up modal
  const modal = document.getElementById('modal');
  const closeBtn = document.getElementsByClassName('close')[0];
  closeBtn.onclick = function () {
    modal.style.display = 'none';
  };
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
});

// Create a graph based on guest connections
async function createGraph(guests) {
  const connections = [];

  for (let i = 0; i < guests.length; i++) {
    for (let j = i + 1; j < guests.length; j++) {
      const message = `Do ${guests[i].name} and ${guests[j].name} know each other?`;
      if (await showModal(message)) {
        connections.push({ source: guests[i], target: guests[j] });
      }
    }
  }

  displayGraph(guests, connections);
}

// Show modal with a message and return a promise that resolves to a boolean
function showModal(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modal");
    const yesButton = document.getElementById("yesButton");
    const noButton = document.getElementById("noButton");
    const modalText = document.getElementById("modalText");

    modalText.textContent = message;
    modal.style.display = "block";

    yesButton.onclick = function () {
      modal.style.display = "none";
      resolve(true);
    };

    noButton.onclick = function () {
      modal.style.display = "none";
      resolve(false);
    };
  });
}

// Display the guest social graph
function displayGraph(guests, connections) {
  // Create SVG elements and groups for nodes and connections
  const width = 800;
  const height = 600;
  const svg = d3
    .select("#graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  const linkGroup = svg.append("g").attr("class", "links");
  const nodeGroup = svg.append("g").attr("class", "nodes");

  // Create D3 simulation with gravitational and connection forces
  const simulation = d3
    .forceSimulation(guests)
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("link", d3.forceLink(connections).distance(100))
    .on("tick", ticked);

  // Draw connections and nodes
  const links = linkGroup
    .selectAll("line")
    .data(connections)
    .enter()
    .append("line")
    .attr("stroke", "#999")
    .attr("stroke-width", 2);

  const nodes = nodeGroup
    .selectAll("circle")
    .data(guests)
    .enter()
    .append("circle")
    .attr("r", 20)
    .attr("fill", "steelblue")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  // Add text labels for each node
  const labels = nodeGroup
    .selectAll("text")
    .data(guests)
    .enter()
    .append("text")
    .attr("dx", 22)
    .attr("dy", ".35em")
    .text((d) => d.name);

  // Update positions of nodes and connections on each simulation "tick"
  function ticked() {
    links
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

    labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
  }

  // Functions to control drag & drop behavior of nodes
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}
