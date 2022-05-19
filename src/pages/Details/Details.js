import React, { useState, useEffect } from 'react'
import QRCode from 'react-qr-code'
// import { useParams } from 'react-router-dom'

import DeviceStructuredTable from './components/DeviceStructuredTable'
import DeviceForm from './components/DeviceForm'

import axios from 'axios'

// mock data
import device from '../../mock_data/device.json'

// Carbon Styling
import { Grid, Column, Button, ButtonSet } from 'carbon-components-react'
import { Edit, Exit, Friendship, Undo } from '@carbon/icons-react'
import SkeletonStructure from './components/SkeletonStructure'
import { useParams } from 'react-router-dom'
import StatusStructuredTable from './components/StatusStructuredTable'
import { useUserType } from '../../global-context'

function checkAuth() {
  var userInfo = JSON.parse(localStorage.getItem('UserInfo'))
  fetch('https://peripheralsloanbackend.mybluemix.net/auth/hasAccess', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'x-access-token': `${userInfo['accessToken']}`,
    },
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json.accessToken)
      if (json.access) {
      } else {
        window.location.hash = '/login'
      }
    })
}

const Details = () => {
  const [onEditMode, setOnEditMode] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [peripheralData, setperipheralData] = useState(device)

  const enableEditMode = () => setOnEditMode(true)
  const disableEditMode = () => setOnEditMode(false)

  const { userType } = useUserType()

  const { serialNumber } = useParams()

  useEffect(() => {
    checkAuth()
  }, [])

  const getItemRequest = () => {
    //const serialNumber = window.location.pathname.split('/').slice(-1)[0];
    console.log(serialNumber)
    setIsDataLoading(true)
    var userInfo = JSON.parse(localStorage.getItem('UserInfo'))
    var requestRowData = {
      headers: {
        'x-access-token': `${userInfo['accessToken']}`,
      },
    }

    axios
      .get(
        `https://peripheralsloanbackend.mybluemix.net/peripheral/${serialNumber}`,
        requestRowData
      )
      .then(({ data }) => {
        console.log(data)
        device = {
          type: data[0],
          brand: data[1],
          model: data[2],
          serialNumber: data[3],
          acceptedConditions: data[4] === 'true' ? true : false,
          isInside: data[5] === 'true' ? true : false,
          securityAuthorization: data[6] === 'true' ? true : false,
          isAvailable: (data[4]===false && data[5]===true && data[6]===false) ? true : false ,
          employeeName: data[7],
          employeeEmail: data[8],
          employeeSerial: data[9],
          employeeArea: data[10],
          mngrName: data[11],
          mngrEmail: data[12],
          date: data[13],
          comment: data[14]
        }
        setperipheralData(device)
        setIsDataLoading(false)
      })
  }

  useEffect(() => {
    getItemRequest()
    // eslint-disable-next-line
  }, [])

  const actionsBlock = () => {
    switch (userType) {
      case 'focal':
        return (
          <ButtonSet stacked>
            {peripheralData.isAvailable ? (
              <Button
                renderIcon={Friendship}
                disabled={onEditMode}
                onClick={() => {
                  setperipheralData({ ...peripheralData, isAvailable: false })
                }}
              >
                Lend
              </Button>
            ) : (
              <Button
                renderIcon={Undo}
                disabled={onEditMode}
                onClick={() => {
                  setperipheralData({ ...peripheralData, isAvailable: true })
                }}
              >
                Return
              </Button>
            )}

            <Button
              renderIcon={Edit}
              disabled={onEditMode}
              kind={'secondary'}
              onClick={enableEditMode}
            >
              Edit
            </Button>
          </ButtonSet>
        )
      case 'requisitor':
        return (
          <ButtonSet stacked>
            <Button
              renderIcon={Friendship}
              disabled={!peripheralData.isAvailable}
            >
              Request
            </Button>
          </ButtonSet>
        )
      case 'security':
        return (
          <ButtonSet stacked>
            <Button renderIcon={Exit} disabled={!peripheralData.isAvailable}>
              Authorize exit
            </Button>
          </ButtonSet>
        )
      default:
        break
    }
  }

  return isDataLoading ? (
    <SkeletonStructure />
  ) : (
    <>
      <Grid className="page-content">
        <Column sm={4} md={8} lg={4} className="actions-block">
          <h1>{peripheralData.model}</h1>
          {actionsBlock()}

          <div className="qr-code-area">
            <p>QR Code</p>
            <QRCode
              value={`https://peripheral-loans-equipo7.mybluemix.net/#/devices/${serialNumber}`}
              size={200}
            />
          </div>
        </Column>
        <Column sm={4} md={8} lg={12} className="table-block">
          {onEditMode ? (
            <DeviceForm
              device={peripheralData}
              disableEditMode={disableEditMode}
            />
          ) : (
            <>
              <DeviceStructuredTable device={peripheralData} />
              <StatusStructuredTable device={peripheralData} />
            </>
          )}
        </Column>
      </Grid>
    </>
  )
}

export default Details
