import React from 'react';
import ReactDOM from 'react-dom';

import ClayAlert from '@clayui/alert';
import ClayButton from '@clayui/button';
import ClayForm, {ClayInput, ClayRadio, ClayRadioGroup} from '@clayui/form';
import ClayList from '@clayui/list';
import ClayLoadingIndicator from '@clayui/loading-indicator';

import debounce from 'lodash.debounce';

const loadingStyles = {
	backgroundColor: 'rgba(0,0,0,0.2)',
	borderRadius: '5px',
	height: '100%',
	width: '100%',
	zIndex: 1
};

const LOCATION_METHOD_MAP = {
	city: 'city',
	currentLocation: 'currentLocation'
};

export default class extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			city: 'Dubai',
			country: 'UAE',
			latitude: null,
			locationError: null,
			locationMethod: LOCATION_METHOD_MAP.currentLocation,
			longitude: null,
			timings: {
				data: {},
				error: null,
				loading: false
			}
		};

		this._fetchTimings = this._fetchTimings.bind(this);
		this._handleCityChange = this._handleCityChange.bind(this);
		this._handleCountryChange = this._handleCountryChange.bind(this);
		this._handleLocationMethodChange = this._handleLocationMethodChange.bind(this);
		this._handleSubmit = this._handleSubmit.bind(this);
		this._setGeolocation = this._setGeolocation.bind(this);

		this._getTimings = debounce(this._getTimings, 400, {leading: true});

		this._setGeolocation();
	}

	_fetchTimings() {
		this.setState({
			timings: {
				data: this.state.timings.data,
				loading: true
			}
		});

		const {
			city,
			country,
			latitude,
			longitude,
			locationMethod
		} = this.state;


		if (locationMethod === LOCATION_METHOD_MAP.currentLocation && latitude && longitude) {
			this._getTimings(`http://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=8`);
		}
		else {
			this._getTimings(`http://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=8`);
		}
	}

	_getTimings(url) {
		const request = fetch(url);

		request.then(res => res.json())
			.then(
				(result) => {
					const {code} = result;

					if (code === 200) {
						this.setState({
							timings: {
								data: result.data.timings,
								loading: false
							}
						});
					}
					else {
						let error = 'There was an error processing your request.';

						if (code === 429) {
							error = 'You have made too many requests. Please try again in a few minutes.'
						}

						this.setState({
							timings: {
								data: this.state.timings.data,
								error,
								loading: false
							}
						});

					}
				}
			);
	}

	_handleCityChange(event) {
		this.setState({
			city: event.target.value
		})
	}

	_handleCountryChange(event) {
		this.setState({
			country: event.target.value
		})
	}

	_handleLocationMethodChange(locationMethod) {
		this.setState(
			{
				locationMethod
			},
			() => {
				if (locationMethod === LOCATION_METHOD_MAP.currentLocation) {
					this._setGeolocation();
				}
			}
		);
	}

	_handleSubmit(event) {
		event.preventDefault();

		this._fetchTimings();
	}

	_setGeolocation() {
		const instance = this;

		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				function(position) {
					const {coords} = position;

					instance.setState(
						{
							latitude: coords.latitude,
							longitude: coords.longitude
						},
						instance._fetchTimings
					);
				},
				function() {
					instance.setState({
						locationError: Liferay.Language.get('please-share-your-location-in-order-to-use-your-current-location-for-prayer-times')
					})
				}
			);
		}
	}

	render() {
		const {
			city,
			country,
			locationError,
			locationMethod,
			timings
		} = this.state;

		const timingsData = timings.data;

		return (
			<div>
				<label htmlFor="locationMethod">{Liferay.Language.get('get-prayer-times-by')}</label>

				<ClayRadioGroup
					id="locationMethod"
					inline
					onSelectedValueChange={this._handleLocationMethodChange}
					selectedValue={locationMethod}
				>
					<ClayRadio label={Liferay.Language.get('current-location')} value={LOCATION_METHOD_MAP.currentLocation} />
					<ClayRadio label={Liferay.Language.get('city')} value={LOCATION_METHOD_MAP.city} />
				</ClayRadioGroup>

				{locationMethod == LOCATION_METHOD_MAP.city &&
					<ClayForm onSubmit={this._handleSubmit}>
						<ClayForm.Group className="form-group-autofit">
							<div className="form-group-item">
								<label htmlFor="city">{Liferay.Language.get('city')}</label>

								<ClayInput
									id="city"
									onChange={this._handleCityChange}
									placeholder="Abu Dhabi"
									required
									type="text"
									value={city}
								/>
							</div>

							<div className="form-group-item">
								<label htmlFor="country">{Liferay.Language.get('country')}</label>

								<ClayInput
									id="country"
									onChange={this._handleCountryChange}
									placeholder="United Arab Emirates"
									required
									type="text"
									value={country}
								/>
							</div>
						</ClayForm.Group>
						<ClayForm.Group className="form-group-autofit">
							<div className="form-group-item">
								<ClayButton displayType="primary" type="submit">
									{Liferay.Language.get('get-prayer-times')}
								</ClayButton>
							</div>
						</ClayForm.Group>
					</ClayForm>
				}

				{timings.error &&
					<ClayAlert displayType="warning" title="Error">
						{timings.error}
					</ClayAlert>
				}

				{locationError && locationMethod === LOCATION_METHOD_MAP.currentLocation &&
					<ClayAlert displayType="warning" title="Error">
						{locationError}
					</ClayAlert>
				}

				<div className="position-relative">

					{timings.loading &&
						<div className="align-items-center d-flex justify-content-center position-absolute" style={loadingStyles}>
							<ClayLoadingIndicator />
						</div>
					}

					<ClayList>
						<ClayList.Header>{Liferay.Language.get('timings')}</ClayList.Header>
						<ClayList.Item className="align-items-center" flex>
							<ClayList.ItemField className="col-6">
								<ClayList.ItemTitle>{Liferay.Language.get('fajr')}</ClayList.ItemTitle>
							</ClayList.ItemField>

							<ClayList.ItemField className="col-6">{timingsData.Fajr && timingsData.Fajr}</ClayList.ItemField>
						</ClayList.Item>
						<ClayList.Item className="align-items-center" flex>
							<ClayList.ItemField className="col-6">
								<ClayList.ItemTitle>{Liferay.Language.get('dhuhr')}</ClayList.ItemTitle>
							</ClayList.ItemField>

							<ClayList.ItemField className="col-6">{timingsData.Dhuhr && timingsData.Dhuhr}</ClayList.ItemField>
						</ClayList.Item>
						<ClayList.Item className="align-items-center" flex>
							<ClayList.ItemField className="col-6">
								<ClayList.ItemTitle>{Liferay.Language.get('asr')}</ClayList.ItemTitle>
							</ClayList.ItemField>

							<ClayList.ItemField className="col-6">{timingsData.Asr && timingsData.Asr}</ClayList.ItemField>
						</ClayList.Item>
						<ClayList.Item className="align-items-center" flex>
							<ClayList.ItemField className="col-6">
								<ClayList.ItemTitle>{Liferay.Language.get('maghrib')}</ClayList.ItemTitle>
							</ClayList.ItemField>

							<ClayList.ItemField className="col-6">{timingsData.Maghrib && timingsData.Maghrib}</ClayList.ItemField>
						</ClayList.Item>
						<ClayList.Item className="align-items-center" flex>
							<ClayList.ItemField className="col-6">
								<ClayList.ItemTitle>{Liferay.Language.get('isha')}</ClayList.ItemTitle>
							</ClayList.ItemField>

							<ClayList.ItemField className="col-6">{timingsData.Isha && timingsData.Isha}</ClayList.ItemField>
						</ClayList.Item>
					</ClayList>
				</div>
			</div>
		);
	}	
}