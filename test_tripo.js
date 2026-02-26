import dotenv from 'dotenv';
dotenv.config();

const testTripo = async () => {
    const TRIPO_API_KEY = "tsk_dvbp3tJgl7tI0SUowyVY_XNqZGgrjR4QsNPYEbkpTfk";
    try {
        console.log("Submitting task...");
        const response = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TRIPO_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "type": "text_to_model",
                "prompt": "a simple set of golden grillz conforming to human teeth. single bottom tooth cap. photorealistic."
            })
        });

        const data = await response.json();
        console.log("Task submitted:", data);
        
        if (data.code === 0) {
            const taskId = data.data.task_id;
            console.log("Task ID:", taskId);
            
            let status = 'queued';
            while (status === 'queued' || status === 'running') {
                console.log("Polling status...");
                await new Promise(r => setTimeout(r, 2000));
                const pollResp = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
                    headers: { 'Authorization': `Bearer ${TRIPO_API_KEY}` }
                });
                const pollData = await pollResp.json();
                status = pollData.data.status;
                console.log("Status:", status);
                if (status === 'success') {
                    console.log("Result URL:", pollData.data.result.model.url);
                    break;
                }
                if (status === 'failed' || status === 'cancelled') {
                    console.error("Task failed:", pollData);
                    break;
                }
            }
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

testTripo();
