import { calculateScore } from '../src/lib/scoring.js';
import { getRequiredSkillsForRole } from '../src/data/demoData.js';

console.log('=== TESTING SCORE SIMULATOR LOGIC ===\n');

// Target role: Frontend Developer
const role = 'Frontend Developer';
const requiredSkills = getRequiredSkillsForRole(role);
const realUserSkills = ['HTML', 'CSS', 'JavaScript'];

// 1. Initial calculation
const initialResult = calculateScore(realUserSkills, requiredSkills);
console.log('1. Initial Real Score:', initialResult.score + '%');
console.log('   Missing Skills:', initialResult.missingSkills);

// 2. Simulate learning "React" (weight 9)
const simulatedSet1 = new Set(['React']);
const simSkills1 = [...realUserSkills, ...Array.from(simulatedSet1)];
const simResult1 = calculateScore(simSkills1, requiredSkills);
console.log('\n2. Toggled "React":');
console.log('   Simulated Score:', simResult1.score + '%');
console.log('   Delta:', `+${simResult1.score - initialResult.score}%`);
if (simResult1.score <= initialResult.score) {
  throw new Error('Score did not increase after toggling React!');
}

// 3. Simulate learning "TypeScript" (weight 8) as well
simulatedSet1.add('TypeScript');
const simSkills2 = [...realUserSkills, ...Array.from(simulatedSet1)];
const simResult2 = calculateScore(simSkills2, requiredSkills);
console.log('\n3. Toggled "React" + "TypeScript":');
console.log('   Simulated Score:', simResult2.score + '%');
console.log('   Delta:', `+${simResult2.score - initialResult.score}%`);
if (simResult2.score <= simResult1.score) {
  throw new Error('Score did not increase after toggling TypeScript!');
}

// 4. Simulate learning all remaining missing skills
initialResult.missingSkills.forEach(s => simulatedSet1.add(s));
const simSkillsAll = [...realUserSkills, ...Array.from(simulatedSet1)];
const simResultAll = calculateScore(simSkillsAll, requiredSkills);
console.log('\n4. Toggled ALL Missing Skills:');
console.log('   Simulated Score:', simResultAll.score + '%');
if (simResultAll.score !== 100) {
  throw new Error(`Expected 100% when all skills mastered, got ${simResultAll.score}%`);
}

// 5. Verify realUserSkills was never mutated
if (realUserSkills.length !== 3 || realUserSkills.includes('React')) {
  throw new Error('realUserSkills array was mutated!');
}
console.log('\n5. Input Immutability Check: PASSED (original skills array unaltered)');

// 6. Reset check
simulatedSet1.clear();
const resetSkills = [...realUserSkills, ...Array.from(simulatedSet1)];
const resetResult = calculateScore(resetSkills, requiredSkills);
console.log('\n6. Reset Check: Simulated Score =', resetResult.score + '% (matches real score: ' + initialResult.score + '%)');
if (resetResult.score !== initialResult.score) {
  throw new Error('Reset failed to match original score!');
}

console.log('\n=============================================');
console.log('ALL SCORE SIMULATOR TESTS PASSED WITH 100% SUCCESS!');
console.log('=============================================');
