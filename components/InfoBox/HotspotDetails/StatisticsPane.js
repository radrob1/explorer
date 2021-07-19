import RewardScaleWidget from '../../Widgets/RewardScaleWidget'
import RelayedWarningWidget from '../../Widgets/WarningWidget'
import StatusWidget from '../../Widgets/StatusWidget'
import StatWidget from '../../Widgets/StatWidget'
import { useHotspotBeaconSums } from '../../../data/beacons'
import { useHotspotWitnessSums } from '../../../data/witnesses'
import InfoBoxPaneContainer from '../Common/InfoBoxPaneContainer'
import ChecklistWidget from '../../Widgets/ChecklistWidget'
import { isRelay } from '../../Hotspots/utils'
import Widget from '../../Widgets/Widget'
import { fetchWitnesses } from '../../../data/hotspots'
import { useAsync } from 'react-async-hook'
import useToggle from '../../../utils/useToggle'
import classNames from 'classnames'
import ChevronIcon from '../../Icons/Chevron'
import RewardsWidgetCustomPeriods from '../../Widgets/RewardsWidgetCustomPeriods'

const StatisticsPane = ({ hotspot }) => {
  const { witnesses, isLoading: isWitnessesLoading } = useHotspotWitnessSums(
    hotspot.address,
    2,
    'week',
  )
  const { beaconSums, isLoading: isBeaconSumsLoading } = useHotspotBeaconSums(
    hotspot.address,
    2,
    'week',
  )

  const { result: witnessesData } = useAsync(fetchWitnesses, [hotspot.address])
  const [showChecklist, toggleShowChecklist] = useToggle()
  return (
    <InfoBoxPaneContainer>
      <RelayedWarningWidget
        isVisible={isRelay(hotspot.status.listenAddrs)}
        warningText={'Hotspot is being Relayed.'}
        link={'https://docs.helium.com/troubleshooting/network-troubleshooting'}
        linkText={'Get help'}
      />
      <RewardsWidgetCustomPeriods
        address={hotspot.address}
        title="Earnings"
        type={'hotspot'}
        periods={[
          { number: 24, type: 'hour' },
          { number: 7, type: 'day' },
          { number: 30, type: 'day' },
        ]}
      />
      <RewardScaleWidget hotspot={hotspot} />
      <StatusWidget hotspot={hotspot} />
      <StatWidget
        title="7D Avg Beacons"
        series={beaconSums}
        isLoading={isBeaconSumsLoading}
        dataKey="sum"
        changeType="percent"
      />
      <StatWidget
        title="7D Avg Witnesses"
        series={witnesses}
        isLoading={isWitnessesLoading}
        dataKey="avg"
        changeType="percent"
      />
      {!showChecklist ? (
        <div
          className="bg-gray-200 p-3 rounded-lg col-span-2 cursor-pointer hover:bg-gray-300"
          onClick={toggleShowChecklist}
        >
          <div
            className={classNames(
              'flex items-center justify-between',
              'text-gray-600 mx-auto text-md px-4 py-3',
            )}
          >
            Load checklist
            <ChevronIcon
              className={classNames(
                'h-4 w-4',
                'ml-1',
                'transform duration-500 transition-all',
                { 'rotate-180': !showChecklist },
              )}
            />
          </div>
        </div>
      ) : (
        <ChecklistWidget hotspot={hotspot} witnesses={witnessesData} />
      )}
    </InfoBoxPaneContainer>
  )
}

export default StatisticsPane
