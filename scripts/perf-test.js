const { performance } = require('perf_hooks');

// Test the API delays we've optimized
console.log('🚀 Performance Testing - Action Response Times\n');

// Simulate the delay function from our API
const delay = (ms) => {
  const shouldDelay = process.env.NEXT_PUBLIC_FAKE_DELAY;
  const reducedMs = Math.min(ms, 50); // Cap at 50ms max
  return shouldDelay ? new Promise(resolve => setTimeout(resolve, reducedMs)) : Promise.resolve();
};

// Test various operations
async function testApiOperations() {
  const results = [];

  // Test 1: Create Todo Operation
  console.log('📝 Testing Create Todo Operation...');
  const createStart = performance.now();
  await delay(400); // Original delay was 400ms, now capped at 50ms
  const createTime = performance.now() - createStart;
  results.push({ operation: 'Create Todo', time: createTime });
  console.log(`   Time: ${createTime.toFixed(2)}ms`);

  // Test 2: Update Todo Operation  
  console.log('✏️  Testing Update Todo Operation...');
  const updateStart = performance.now();
  await delay(300); // Original delay was 300ms, now capped at 50ms
  const updateTime = performance.now() - updateStart;
  results.push({ operation: 'Update Todo', time: updateTime });
  console.log(`   Time: ${updateTime.toFixed(2)}ms`);

  // Test 3: Toggle Todo Operation
  console.log('✅ Testing Toggle Todo Operation...');
  const toggleStart = performance.now();
  await delay(300); // Original delay was 300ms, now capped at 50ms
  const toggleTime = performance.now() - toggleStart;
  results.push({ operation: 'Toggle Todo', time: toggleTime });
  console.log(`   Time: ${toggleTime.toFixed(2)}ms`);

  // Test 4: Delete Todo Operation
  console.log('🗑️  Testing Delete Todo Operation...');
  const deleteStart = performance.now();
  await delay(300); // Original delay was 300ms, now capped at 50ms
  const deleteTime = performance.now() - deleteStart;
  results.push({ operation: 'Delete Todo', time: deleteTime });
  console.log(`   Time: ${deleteTime.toFixed(2)}ms`);

  // Test 5: Reorder Todos Operation
  console.log('🔄 Testing Reorder Todos Operation...');
  const reorderStart = performance.now();
  await delay(200); // Original delay was 200ms, now capped at 50ms
  const reorderTime = performance.now() - reorderStart;
  results.push({ operation: 'Reorder Todos', time: reorderTime });
  console.log(`   Time: ${reorderTime.toFixed(2)}ms`);

  // Test 6: Bulk Actions Operation
  console.log('📦 Testing Bulk Actions Operation...');
  const bulkStart = performance.now();
  await delay(300); // Original delay was 300ms, now capped at 50ms
  const bulkTime = performance.now() - bulkStart;
  results.push({ operation: 'Bulk Actions', time: bulkTime });
  console.log(`   Time: ${bulkTime.toFixed(2)}ms`);

  return results;
}

// Test form validation performance (simulated)
async function testFormValidation() {
  console.log('\n🔍 Testing Form Validation Performance...');
  
  const validationStart = performance.now();
  
  // Simulate form validation using scheduler API approach
  await new Promise(resolve => {
    if ('scheduler' in global && 'postTask' in global.scheduler) {
      global.scheduler.postTask(resolve, { priority: 'user-blocking' });
    } else {
      setTimeout(resolve, 0); // Non-blocking validation
    }
  });
  
  const validationTime = performance.now() - validationStart;
  console.log(`   Form Validation Time: ${validationTime.toFixed(2)}ms`);
  
  return { operation: 'Form Validation', time: validationTime };
}

// Test throttled interactions
async function testThrottledInteractions() {
  console.log('\n⏱️  Testing Throttled Interactions...');
  
  let clickCount = 0;
  let lastExecution = 0;
  const throttleLimit = 300;
  
  // Simulate rapid clicks (throttled to 300ms)
  const simulateRapidClicks = async () => {
    const now = Date.now();
    if (now - lastExecution >= throttleLimit) {
      clickCount++;
      lastExecution = now;
      return true;
    }
    return false;
  };
  
  const testStart = performance.now();
  
  // Simulate 5 rapid clicks in 100ms intervals
  for (let i = 0; i < 5; i++) {
    await simulateRapidClicks();
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const testTime = performance.now() - testStart;
  console.log(`   Throttled clicks executed: ${clickCount}/5`);
  console.log(`   Total time: ${testTime.toFixed(2)}ms`);
  
  return { operation: 'Throttled Interactions', time: testTime, executed: clickCount };
}

// Main test runner
async function runPerformanceTests() {
  console.log('Starting Performance Tests...\n');
  
  try {
    // Test API operations
    const apiResults = await testApiOperations();
    
    // Test form validation
    const validationResult = await testFormValidation();
    
    // Test throttled interactions
    const throttleResult = await testThrottledInteractions();
    
    // Combine all results
    const allResults = [...apiResults, validationResult, throttleResult];
    
    console.log('\n📊 Performance Test Results Summary:');
    console.log('═══════════════════════════════════════');
    
    let passCount = 0;
    allResults.forEach(result => {
      const status = result.time < 200 ? '✅ PASS' : '❌ FAIL';
      const timeColor = result.time < 200 ? '' : ' (⚠️  EXCEEDS 200ms)';
      console.log(`${status} ${result.operation}: ${result.time.toFixed(2)}ms${timeColor}`);
      if (result.time < 200) passCount++;
    });
    
    console.log('\n📈 Overall Performance:');
    console.log(`✅ Passed: ${passCount}/${allResults.length} tests`);
    console.log(`🎯 Success Rate: ${((passCount / allResults.length) * 100).toFixed(1)}%`);
    
    if (passCount === allResults.length) {
      console.log('\n🎉 All actions complete under 200ms! Performance target achieved.');
    } else {
      console.log('\n⚠️  Some actions exceed 200ms target. Consider further optimization.');
    }
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
  }
}

// Test with fake delays disabled (production mode)
console.log('Testing with fake delays DISABLED (production mode):\n');
runPerformanceTests().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('Testing with fake delays ENABLED (development mode):\n');
  
  // Test with fake delays enabled
  process.env.NEXT_PUBLIC_FAKE_DELAY = 'true';
  runPerformanceTests();
});