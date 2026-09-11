import { geminiChatCopilot, geminiClassifyProblem, isGeminiConfigured } from './services/geminiService.js';

async function testGemini() {
  console.log('Gemini configured:', isGeminiConfigured());
  console.log('\n--- 1. Testing Gemini Chat Copilot ---');
  const chatRes = await geminiChatCopilot('How can university researchers and industry partners collaborate on water telemetry projects in Jharkhand?', 'university');
  console.log('Chat response provider:', chatRes?.provider);
  console.log('Chat response preview:\n', chatRes?.reply?.substring(0, 300), '...');

  console.log('\n--- 2. Testing Gemini Problem Veracity Assessment ---');
  const classRes = await geminiClassifyProblem({
    title: 'Solar pump broken in Tamar block',
    description: 'The solar powered submersible pump installed in village Tamar ward 3 is malfunctioning since 2 weeks, depriving 200 farmers of irrigation.',
    district: 'Ranchi',
    block: 'Tamar',
    village: 'Ward 3'
  });
  console.log('Classification provider:', classRes?.provider);
  console.log('Is Real:', classRes?.isReal);
  console.log('Veracity score:', classRes?.veracityScore);
  console.log('Recommended category:', classRes?.recommendedCategory);
  console.log('Rationale:', classRes?.aiRationale);
}

testGemini().catch(err => {
  console.error('Gemini test error:', err);
});
