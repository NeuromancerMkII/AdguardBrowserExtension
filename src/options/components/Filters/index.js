import React, { Fragment, Component } from 'react';
import browser from 'webextension-polyfill';
import sortBy from 'lodash/sortBy';
import Group from './Group';
import Checkbox from '../Settings/Checkbox';


function filterUpdate(props) {
    const { rulesCount, lastUpdateDate, updateClickHandler } = props;
    return (
        <Fragment>
            <div>
                { `"Filter rules count: " ${rulesCount}` }
            </div>
            <div>
                {lastUpdateDate}
            </div>
            <div onChange={updateClickHandler}>update button</div>
        </Fragment>
    );
}

class Filters extends Component {
    state = {
        search: '',
        filtersData: {},
    };

    async componentDidMount() {
        let filtersData;
        try {
            filtersData = await browser.runtime.sendMessage({ type: 'getFiltersData' });
        } catch (e) {
            console.log(e);
        }
        if (filtersData) {
            this.setState(state => ({
                ...state, filtersData,
            }));
        }
    }

    handleSearch = (e) => {
        console.log(e.target.value);
    };

    handleGroupSwitch = ({ id, data }) => {
        console.log(id, data);
    };

    getEnabledFiltersByGroup = (group) => {
        const { filters } = this.state.filtersData;
        return group.filters.map((filterId) => {
            const { enabled, name } = filters[filterId];
            return enabled && name;
        }).filter(name => !!name);
    };

    renderGroups = (groups) => {
        const sortedGroups = sortBy(Object.values(groups), 'order');
        return sortedGroups.map((group) => {
            const enabledFilters = this.getEnabledFiltersByGroup(group);
            return (
                <Group
                    key={group.id}
                    {...group}
                    enabledFilters={enabledFilters}
                >
                    <Checkbox
                        id={group.id}
                        value={group.enabled}
                        handler={this.handleGroupSwitch}
                    />
                </Group>
            );
        });
    };

    render() {
        const { filtersData: { groups } } = this.state;
        return (
            <Fragment>
                <h2 className="title">Filters</h2>
                <input type="text" onChange={this.handleSearch} />
                {groups && this.renderGroups(groups)}
            </Fragment>
        );
    }
}

export default Filters;
