// src/services/tripoApi.js

/**
 * Submits a text-to-3D task to the Tripo AI API and polls for completion.
 * @param {string} userDescription The raw design description from the user
 * @returns {Promise<string>} The URL of the generated .glb file
 */
export const generateGrillzMesh = async (userDescription) => {
    const API_KEY = import.meta.env.VITE_TRIPO_API_KEY;
    
    if (!API_KEY) {
        throw new Error("Tripo API key is missing from environment variables.");
    }

    // The hidden system prompt that strictly formats the user's idea
    const systemPrompt = `generate a highly detailed set of upper and lower grillz, capturing the full dental arc conforming to a human teeth model. Photorealistic style, metallic surface. User design request: ${userDescription}`;

    try {
        // 1. Submit the task
        const response = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "type": "text_to_model",
                "prompt": systemPrompt
            })
        });

        const data = await response.json();
        
        if (data.code !== 0) {
            throw new Error(`Tripo API Error: ${data.message || 'Failed to submit task'}`);
        }

        const taskId = data.data.task_id;
        
        // 2. Poll for completion (Tripo usually takes 10-15s for draft models)
        let status = 'queued';
        while (status === 'queued' || status === 'running') {
            // Wait 2.5 seconds between polls
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            const pollResp = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            });
            
            const pollData = await pollResp.json();
            
            if (pollData.code !== 0) {
                 throw new Error(`Tripo Polling Error: ${pollData.message}`);
            }

            status = pollData.data.status;
            
            if (status === 'success') {
                return pollData.data.result.pbr_model?.url || pollData.data.result.model?.url;
            }
            
            if (status === 'failed' || status === 'cancelled') {
                throw new Error("Tripo generation failed or was cancelled.");
            }
        }
    } catch (error) {
        console.error("3D Generation Error:", error);
        throw error;
    }
};
