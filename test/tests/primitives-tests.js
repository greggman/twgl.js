import * as primitives from '../../src/primitives.js';

import {
  assertTruthy,
} from '../assert.js';
import {describe, it} from '../mocha-support.js';

describe('primitives tests', () => {

  // For every non-degenerate triangle, the normals of its vertices should
  // point to the same side as the triangle's counter-clockwise winding.
  function checkNormalsMatchWinding(vertices) {
    const {position, normal, indices} = vertices;
    const numComponents = position.numComponents || 3;
    const numVertices = position.length / numComponents;
    const numIndices = indices ? indices.length : numVertices;
    const getPosition = ndx => [0, 1, 2].map(i => i < numComponents ? position[ndx * numComponents + i] : 0);
    const mismatches = [];
    for (let i = 0; i < numIndices; i += 3) {
      const ndxs = [0, 1, 2].map(j => indices ? indices[i + j] : i + j);
      const [p0, p1, p2] = ndxs.map(getPosition);
      const u = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
      const v = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
      const faceNormal = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ];
      if (Math.hypot(...faceNormal) < 1e-9) {
        continue;
      }
      const vertexNormal = [0, 0, 0];
      for (const ndx of ndxs) {
        for (let j = 0; j < 3; ++j) {
          vertexNormal[j] += normal[ndx * 3 + j];
        }
      }
      const dot = faceNormal[0] * vertexNormal[0] + faceNormal[1] * vertexNormal[1] + faceNormal[2] * vertexNormal[2];
      if (dot <= 0) {
        mismatches.push(i / 3);
      }
    }
    assertTruthy(mismatches.length === 0, `normals point away from the winding for triangles: ${mismatches.join(', ')}`);
  }

  const tests = [
    {name: 'XYQuad', create: () => primitives.createXYQuadVertices(2)},
    {name: 'Plane', create: () => primitives.createPlaneVertices(2, 3, 4, 5)},
    {name: 'Sphere', create: () => primitives.createSphereVertices(1, 12, 8)},
    {name: 'Cube', create: () => primitives.createCubeVertices(2)},
    {name: 'TruncatedCone', create: () => primitives.createTruncatedConeVertices(1, 0.5, 2, 12, 3)},
    {name: 'Cylinder', create: () => primitives.createCylinderVertices(1, 2, 12, 3)},
    {name: 'Torus', create: () => primitives.createTorusVertices(1, 0.3, 12, 8)},
    {name: 'Disc', create: () => primitives.createDiscVertices(1, 12, 3, 0.3)},
    {name: '3DF', create: () => primitives.create3DFVertices()},
  ];

  for (const {name, create} of tests) {
    it(`create${name}Vertices normals match winding`, () => {
      checkNormalsMatchWinding(create());
    });
  }

});
