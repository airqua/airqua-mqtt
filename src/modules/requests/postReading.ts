import {SensorReadingPost} from "../../types/domain";
import {env} from "../../env";

export const postReading = async (sensorId: string, token: string, readings: SensorReadingPost[]) => {
    const r = await fetch(env.API_BASE_URL + `/sensors/${sensorId}/readings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(readings)
    });

    if(!r.ok) throw new Error(r.statusText.toString());

    return r.json();
}