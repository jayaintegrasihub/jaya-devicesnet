# Jaya Water Monitoring API Document

## Get Last Data 
  **GET** ```{{url}}telemetry/last/:serialNumber```

  ### Authentication
  API KEY - add to header with key "api-key"

  ### Param
  Using serialNumber device

  ### Query
  List of Query
  - fields *required (Note, if want to get fields data more than one that can use comma as separator ex. TDS,loraRssi,messageId)
  - building *optional
  - floor *optional
  - division *optional
  - tray *optional

  ### Response Message
  ```
  -- If data not empty --
  {
    "status": "success",
    "data": {
      "telemetry": {
        "TDS": {
          "_time": "2024-01-12T13:01:34Z",
          "_value": 0,
          "Building": "Atas",
          "Floor": "1",
          "_field": "TDS",
          "device": "AI3494545BA558",
          "gateway": "MIA744DBD758A68"
        },
        "loraRssi": {
          "_time": "2024-01-12T13:01:34Z",
          "_value": 222,
          "Building": "Atas",
          "Floor": "1",
          "_field": "loraRssi",
          "device": "AI3494545BA558",
          "gateway": "MIA744DBD758A68"
        },
        "messageId": {
          "_time": "2024-01-12T13:01:34Z",
          "_value": 38469,
          "Building": "Atas",
          "Floor": "1",
          "_field": "messageId",
          "device": "AI3494545BA558",
          "gateway": "MIA744DBD758A68"
        }
      }
    }
  }

  -- If data empty --
  {
    "status": "success",
    "data": {
      "telemetry":{}
    }
  }
  ```
<div style="page-break-after: always;"></div>

## Get History Data 
  **GET** ```{{url}}telemetry/last/:serialNumber```

  ### Authentication
  API KEY - add to header with key "api-key"

  ### Param
  Using serialNumber device

  ### Query
  List of Query
  - fields *required (Note, if want to get fields data more than one that can use comma as separator ex. TDS,loraRssi,messageId)
  - startTime *required (Note, using ISO 8601 format with UTC timezone. ex. 2022-01-12T13:01:34Z)
  - endTime *required (Note, using ISO 8601 format with UTC timezone. ex. 2024-01-12T13:01:34Z)
  - building *optional
  - floor *optional
  - division *optional
  - tray *optional
  - aggregate *optional (Duration of windows ex. 1m,2m,10m,1h,2h)

  ### Response Message
  ```
  -- If data not empty --
  {
	"status": "success",
	"data": {
		"telemetries": {
			"TDS": [
				{
					"_time": "2024-01-12T12:37:40Z",
					"_value": 0,
					"Building": "Atas",
					"Floor": "1",
					"_field": "TDS",
					"device": "AI3494545BA558",
					"gateway": "MIA744DBD758A68"
				},
				{
					"_time": "2024-01-12T12:37:45Z",
					"_value": 0,
					"Building": "Atas",
					"Floor": "1",
					"_field": "TDS",
					"device": "AI3494545BA558",
					"gateway": "MIA744DBD758A68"
				}
			],
			"loraRssi": [
				{
					"_time": "2024-01-12T12:37:40Z",
					"_value": 222,
					"Building": "Atas",
					"Floor": "1",
					"_field": "loraRssi",
					"device": "AI3494545BA558",
					"gateway": "MIA744DBD758A68"
				},
				{
					"_time": "2024-01-12T12:37:45Z",
					"_value": 222,
					"Building": "Atas",
					"Floor": "1",
					"_field": "loraRssi",
					"device": "AI3494545BA558",
					"gateway": "MIA744DBD758A68"
				}
			],
			"messageId": [
				{
					"_time": "2024-01-12T12:37:40Z",
					"_value": 38050,
					"Building": "Atas",
					"Floor": "1",
					"_field": "messageId",
					"device": "AI3494545BA558",
					"gateway": "MIA744DBD758A68"
				},
				{
					"_time": "2024-01-12T12:37:45Z",
					"_value": 38051,
					"Building": "Atas",
					"Floor": "1",
					"_field": "messageId",
					"device": "AI3494545BA558",
					"gateway": "MIA744DBD758A68"
        }]
      }
    }
  }

    -- If data empty --
  {
    "status": "success",
    "data": {
      "telemetry":{}
    }
  }
  ```