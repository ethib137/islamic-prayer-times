import React from 'react';
import ReactDOM from 'react-dom';

import ClayAlert from '@clayui/alert';
import ClayForm, {ClayInput} from '@clayui/form';
import ClayList from '@clayui/list';
import ClayLoadingIndicator from '@clayui/loading-indicator';

const loadingStyles = {
	backgroundColor: 'rgba(0,0,0,0.2)',
	borderRadius: '5px',
	height: '100%',
	width: '100%',
	zIndex: 1
};

export default class extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			city: 'London',
			country: 'UK',
			timings: {
				data: {},
				loading: false
			}
		};

		this._fetchTimings = this._fetchTimings.bind(this);
		this._handleCityChange = this._handleCityChange.bind(this);
		this._handleCountryChange = this._handleCountryChange.bind(this);
		this._handleSubmit = this._handleSubmit.bind(this);
	}

	_fetchTimings() {
		this.setState({
			timings: {
				data: this.state.timings.data,
				loading: true
			}
		});

		const {city, country} = this.state;

		const response = fetch(`http://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=8`)
			.then(res => res.json())
			.then(
				(result) => {
					console.log(result);

					if (result.code == 200) {
						this.setState({
							timings: {
								data: result.data.timings,
								loading: false
							}
						});
					}
					else {
						this.setState({
							timings: {
								data: this.state.timings.data,
								error: 'There was an error processing your request.',
								loading: false
							}
						});

					}
				}
			);
	}

	_handleCityChange(event) {
		console.log(event);

		this.setState({
			city: event.target.value
		})
	}

	_handleCountryChange(event) {
		console.log(event);

		this.setState({
			country: event.target.value
		})
	}

	_handleSubmit(event) {
		event.preventDefault();

		this._fetchTimings();
	}

	render() {
		const {city, country} = this.state;

		const timings = this.state.timings.data;
		const {error, loading} = this.state.timings;

		return (
			<div>
				<ClayForm onSubmit={this._handleSubmit}>
					<ClayForm.Group className="form-group-autofit">
						<div className="form-group-item">
							<label htmlFor="country">Liferay.Language.get('country')</label>

							<ClayInput
								id="country"
								onChange={this._handleCountryChange}
								placeholder="United Arab Emirates"
								type="text"
								value={country}
							/>
						</div>

						<div className="form-group-item">
							<label htmlFor="city">Liferay.Language.get('city')</label>

							<ClayInput
								id="city"
								onChange={this._handleCityChange}
								placeholder="Abu Dhabi"
								type="text"
								value={city}
							/>
						</div>
					</ClayForm.Group>
					<ClayForm.Group className="form-group-autofit">
						<div className="form-group-item">
							<ClayInput
								className="btn btn-primary"
								type="submit"
								value={Liferay.Language.get('get-prayer-times')}
							/>
						</div>
					</ClayForm.Group>
				</ClayForm>

				{error &&
					<ClayAlert displayType="warning" title="Error">
						{error}
					</ClayAlert>
				}

				<div className="position-relative">

					{loading &&
						<div className="align-items-center d-flex justify-content-center position-absolute" style={loadingStyles}>
							<ClayLoadingIndicator />
						</div>
					}

					<ClayList>
						<ClayList.Header>{Liferay.Language.get('timings')}</ClayList.Header>
						<ClayList.Item flex>
							<ClayList.ItemField className="col-6">
								<ClayList.ItemTitle>{Liferay.Language.get('fajr')}</ClayList.ItemTitle>
							</ClayList.ItemField>

							<ClayList.ItemField className="col-6">{timings.Fajr && timings.Fajr}</ClayList.ItemField>
						</ClayList.Item>
						<ClayList.Item flex>
							<ClayList.ItemField className="col-6">
								<ClayList.ItemTitle>{Liferay.Language.get('dhuhr')}</ClayList.ItemTitle>
							</ClayList.ItemField>

							<ClayList.ItemField className="col-6">{timings.Dhuhr && timings.Dhuhr}</ClayList.ItemField>
						</ClayList.Item>
						<ClayList.Item flex>
							<ClayList.ItemField className="col-6">
								<ClayList.ItemTitle>{Liferay.Language.get('asr')}</ClayList.ItemTitle>
							</ClayList.ItemField>

							<ClayList.ItemField className="col-6">{timings.Asr && timings.Asr}</ClayList.ItemField>
						</ClayList.Item>
						<ClayList.Item flex>
							<ClayList.ItemField className="col-6">
								<ClayList.ItemTitle>{Liferay.Language.get('maghrib')}</ClayList.ItemTitle>
							</ClayList.ItemField>

							<ClayList.ItemField className="col-6">{timings.Maghrib && timings.Maghrib}</ClayList.ItemField>
						</ClayList.Item>
						<ClayList.Item flex>
							<ClayList.ItemField className="col-6">
								<ClayList.ItemTitle>{Liferay.Language.get('isha')}</ClayList.ItemTitle>
							</ClayList.ItemField>

							<ClayList.ItemField className="col-6">{timings.Isha && timings.Isha}</ClayList.ItemField>
						</ClayList.Item>
					</ClayList>
				</div>
			</div>
		);
	}	
}