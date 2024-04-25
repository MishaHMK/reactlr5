import React, { useState, useEffect } from 'react';
import AWS from 'aws-sdk';
import { Card, Row, Col } from 'antd';

AWS.config.update({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-2'
});

const DynamoDB = new AWS.DynamoDB.DocumentClient();

const DynamoDBComponent = () => {
  const [latestData, setLatestData] = useState(null);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const params = {
          TableName: ''
        };
        const response = await DynamoDB.scan(params).promise();
        console.log(response);
        let maxSampleTime = 0;
        let latestItem = null;
        response.Items.forEach(item => {
          const sampleTime = parseInt(item.recieve_time);
          if (sampleTime > maxSampleTime) {
            maxSampleTime = sampleTime;
            latestItem = item;
          }
        });

        if (latestItem) {
          setLatestData(latestItem);
        }
        
      } catch (error) {
        console.error('Error fetching latest data:', error);
      }
    };

    fetchLatestData();
  }, []); 

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });
  };

  const getTemperatureStatus = (temperature) => {
    if (temperature < 15) {
      return { status: "Cold", color: "blue" };
    } else if (temperature >= 15 && temperature < 25) {
      return { status: "Moderate", color: "yellow" };
    } else {
      return { status: "Hot", color: "orange" };
    }
  };

  const getHumidityStatus = (humidity) => {
    if (humidity < 30) {
      return { status: "Dry", color: "darkgray" };
    } else if (humidity >= 30 && humidity < 70) {
      return { status: "Moderate", color: "lightblue" };
    } else {
      return { status: "Humid", color: "purple" };
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginTop: 20 }}>Latest DynamoDB Data:</h2>
        {latestData && (
          <Row gutter={[16, 16]} justify="center">
            <Col>
              <Card title="Temperature" headStyle={{ background: '#001529', color: '#fff' }}  
                                        style={{ width: 300, border: '1px solid #ccc' }}>
                <p style={{ fontSize: '2em', fontWeight: 'bold'}}>{latestData.device_data.temperature}°C</p>
                <p style={{ fontSize: '3em', fontWeight: 'bold', 
                color: getTemperatureStatus(parseInt(latestData.device_data.temperature)).color }}>
                  {getTemperatureStatus(parseInt(latestData.device_data.temperature)).status}
                </p>
              </Card>
            </Col>
            <Col>
            <Card title="Humidity" headStyle={{ background: '#001529', color: '#fff' }} 
                                  style={{ width: 300, border: '1px solid #ccc' }}>
                <p style={{ fontSize: '2em', fontWeight: 'bold'}}>{latestData.device_data.humidity}%</p>
                <p style={{ fontSize: '3em', fontWeight: 'bold', 
                color: getHumidityStatus(parseInt(latestData.device_data.humidity)).color }}>
                  {getHumidityStatus(parseInt(latestData.device_data.humidity)).status}
                </p>
            </Card>
            </Col>
          </Row>
        )}
        {latestData && (
          <p style={{ textAlign: 'center'}}>
            Data received: {formatDateTime(parseInt(latestData.recieve_time))}</p>
        )}
      </div>
    </div>
  );
};

export default DynamoDBComponent;