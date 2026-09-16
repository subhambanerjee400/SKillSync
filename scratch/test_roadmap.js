import { generateRoadmap } from '../src/lib/roadmap.js';
import { getRequiredSkillsForRole } from '../src/data/demoData.js';

console.log('=== TESTING SKILL ROADMAP GENERATION LOGIC ===\n');

// ----------------------------------------------------------------------------
// TEST 1: Frontend Developer (Partial Match)
// ----------------------------------------------------------------------------
console.log('--- TEST 1: Frontend Developer ---');
const frontendReqs = getRequiredSkillsForRole('Frontend Developer');
const frontendMatched = ['HTML', 'CSS', 'JavaScript'];
const frontendMissing = ['React', 'TypeScript', 'Git', 'REST APIs', 'Testing'];

const frontendRoadmap = generateRoadmap(frontendMatched, frontendMissing, frontendReqs);
console.log('Total Steps:', frontendRoadmap.length);
frontendRoadmap.forEach((step, idx) => {
  console.log(`  [Step ${idx + 1}] ${step.skill.padEnd(20)} | Status: ${step.status.padEnd(8)} | Weight: ${step.weight} | Demand: ${step.demandStatus}`);
});

// Check done steps
const doneSteps = frontendRoadmap.filter(s => s.status === 'done');
if (doneSteps.length !== 3) {
  throw new Error(`Expected 3 done steps, got ${doneSteps.length}`);
}

// Check next step
const nextSteps = frontendRoadmap.filter(s => s.status === 'next');
if (nextSteps.length !== 1) {
  throw new Error(`Expected exactly 1 next step, got ${nextSteps.length}`);
}
// For Frontend Developer, React has weight 9 (highest missing), so React MUST be next!
if (nextSteps[0].skill !== 'React') {
  throw new Error(`Expected "React" to be the next step (highest weight), got "${nextSteps[0].skill}"`);
}
console.log('✔ "React" (weight 9) correctly selected as single "next" focus milestone.');

// Check upcoming order
const upcomingSteps = frontendRoadmap.filter(s => s.status === 'upcoming');
console.log('Upcoming steps count:', upcomingSteps.length);
for (let i = 0; i < upcomingSteps.length - 1; i++) {
  if (upcomingSteps[i].weight < upcomingSteps[i + 1].weight) {
    throw new Error(`Upcoming steps not in descending weight order: ${upcomingSteps[i].weight} < ${upcomingSteps[i + 1].weight}`);
  }
}
console.log('✔ Upcoming steps strictly ordered by descending impact weight.');
console.log('✔ TEST 1 PASSED.\n');

// ----------------------------------------------------------------------------
// TEST 2: Trade Role (Electrician)
// ----------------------------------------------------------------------------
console.log('--- TEST 2: Electrician ---');
const electricianReqs = getRequiredSkillsForRole('Electrician');
const electricianMatched = ['Electrical Wiring'];
const electricianMissing = ['Electrical Safety', 'Testing Equipment', 'Solar Panel Installation', 'Smart Meter Installation'];

const electricianRoadmap = generateRoadmap(electricianMatched, electricianMissing, electricianReqs);
console.log('Total Steps:', electricianRoadmap.length);
const elecNext = electricianRoadmap.find(s => s.status === 'next');
console.log('Electrician Next Focus:', elecNext?.skill, `(wt: ${elecNext?.weight})`);

if (!elecNext || elecNext.status !== 'next') {
  throw new Error('Electrician next milestone missing!');
}
console.log('✔ TEST 2 PASSED.\n');

// ----------------------------------------------------------------------------
// TEST 3: All Skills Mastered (100% Readiness)
// ----------------------------------------------------------------------------
console.log('--- TEST 3: All Skills Mastered ---');
const fullRoadmap = generateRoadmap(['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Git', 'REST APIs', 'Testing'], [], frontendReqs);
if (fullRoadmap.some(s => s.status !== 'done')) {
  throw new Error('Expected all steps to be "done" when missing is empty');
}
console.log('✔ Handled 100% readiness with all steps marked "done".');
console.log('✔ TEST 3 PASSED.\n');

console.log('=====================================================');
console.log('ALL SKILL ROADMAP TESTS PASSED WITH 100% SUCCESS!');
console.log('=====================================================');
