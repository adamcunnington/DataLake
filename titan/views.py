from datetime import datetime, timedelta
from flask import jsonify, redirect, render_template, request
from markupsafe import Markup
from random import random, randint
from time import sleep

import titan


app = titan.create_app()

# Page URLs

@app.after_request
def after_request(response):
    response.set_cookie("AppServiceAuthSession", request.cookies.get("AppServiceAuthSession", ""))
    return response


@app.route('/')
def index():
    return redirect('/monitoring')

@app.route('/monitoring')
def monitoring():
    return render_template('monitoring.html', access_token=get_access_token())

@app.route('/monitoring/executions/<int:execution_key>')
def monitoring_execution(execution_key):
    # TODO return full set of data for execution?
    data = Markup({ 'executionKey': execution_key })
    return render_template('execution.html', access_token=get_access_token(), data=data)

@app.route("/schedules")
def schedules():
    return render_template("schedules.html", access_token=get_access_token())

@app.route('/schedules/<int:schedule_key>')
def schedule_details(schedule_key):

    # NOTE: 'run now' button, links to the adhoc page pre-filled (if possible)
    data = Markup({ 'scheduleKey': schedule_key })
    return render_template('schedule.html', access_token=get_access_token(), data=data)

@app.route('/schedules/add')
def schedule_add():
    data = Markup({})
    return render_template('schedule.html', access_token=get_access_token(), data=data)

@app.route('/adhoc')
def adhoc():

    data = {}

    schedule_id = request.args.get('schedule')
    if schedule_id:
        data['scheduleId'] = int(schedule_id)

    data = Markup(data)

    return render_template('adhoc.html', access_token=get_access_token(), data=data)


# API URLs

@app.route('/api/executions/')
def executions_list():

    end_date = request.args.get('end_date')

    end_date = datetime.strptime(end_date, '%Y-%m-%d')
    start_date = end_date - timedelta(days=4)

    return get_execution_data(start_date, end_date)


@app.route('/api/executions', methods=['POST'])
def execute():

    # TODO handle adhoc execution

    return jsonify([])


@app.route('/api/executions/<int:execution_key>')
def execution_get(execution_key):

    data = get_execution(execution_key)

    return jsonify(data)


@app.route('/api/executions/<int:execution_key>', methods=['PUT'])
def execution_update(execution_key):

    # TODO update execution

    return jsonify([])


@app.route('/api/executions/retry', methods=['POST'])
def execution_retry():

    data = request.get_data('executions')

    start_date = datetime.now() - timedelta(days=5)
    end_date = datetime.now() - timedelta(days=1)

    return get_execution_data(start_date, end_date)


"""@app.route('/api/schedules')
def schedules_list():
    # TODO support filtering by querystring?

    limit = 0

    return jsonify(get_schedules(limit))"""


"""@app.route('/api/schedules', methods=['POST'])
def schedule_create():
    # TODO create schedule?
    return jsonify({
        'id': key()
    })"""


@app.route('/api/schedules/<int:schedule_key>')
def schedules_get(schedule_key):
    return jsonify(get_schedule(schedule_key))


# Should this be merged with /api/schedules POST?
@app.route('/api/schedules/<int:schedule_key>', methods=['PUT'])
def schedule_update(schedule_key):
    # TODO update schedule
    return jsonify([])


@app.route('/api/acquire-programs')
def acquire_programs_list():
    return jsonify(get_acquire_programs())


@app.route('/api/extract-programs')
def extract_programs_list():
    return jsonify(get_extract_programs())



# Access Token

def get_access_token():
    return "Bearer %s" % request.headers.get("X-MS-TOKEN-AAD-ID-TOKEN", "")


# SAMPLE DATA

# Executions

def get_execution_data(start_date, end_date):

    # Small delay
    sleep(.5)

    data = {}

    clients = [
        'InGen Bioengineering %i' % randint(0, 9),
        'Nedry Solutions %i' % randint(0, 9),
        'Dr. Grant and Co %i' % randint(0, 9)
    ]

    data_sources = [
        'Facebook %i' % randint(0, 9),
        'DCM %i' % randint(0, 9),
        'MySpace %i' % randint(0, 9)
    ]

    data_sets = [
        'Data set %i' % randint(1, 10),
        'Data set %i' % randint(11, 20),
        'Data set %i' % randint(21, 30),
        'Data set %i' % randint(31, 40)
    ]

    for client in clients:

        client_data = {}

        for data_source in data_sources:

            data_source_data = {}

            for data_set in data_sets:

                data_set_data = {}

                temp_date = start_date

                while temp_date <= end_date:

                    acquire_state = get_state()
                    extract_state = get_state(prev_state=acquire_state)

                    data_set_data[temp_date.strftime('%Y-%m-%d')] = {
                        'ExecutionKey': key(),
                        'AcquireProgramKey': randint(1, 5),
                        'AcquireStartTime': get_time(),
                        'AcquireStatus': acquire_state,
                        'ExtractStartTime': get_time(),
                        'ExtractStatus': extract_state
                    }

                    temp_date += timedelta(days=1)

                data_source_data[data_set] = data_set_data

            client_data[data_source] = data_source_data

        data[client] = client_data

    return jsonify({ 'data': data })


def get_time():
    return '%s:%s:%s' % (pad(randint(0, 23)), pad(randint(0, 59)), pad(randint(0, 59)))

def pad(number):
    if number < 10:
        return '0%i' % number
    else:
        return str(number)


def get_execution(id):

    execution = {
        'ExecutionKey': id,
        'ExecutionContainerGroupName': 'Container %s' % az(),
        'ScheduledExecutionKey': key(),
        'ExecutionScheduledTime': '14:23:35',
        'ExecutionStartTime': '14:23:52',
        'ExecutionEndTime': '14:27:29',
        'ExecutionSuccessful': (random() < .5),
        'ExecutionClientName': 'Client %s' % az(),
        'ExecutionDataSourceName': 'Data Source %s' % az(),
        'ExecutionDataSetName': 'Data Set %s' % az(),
        'ExecutionLoadDate': datetime.now(),
        'ExecutionVersion': randint(1, 3),
        'ExecutionUser': 'User %s' % az(),
        'AcquireProgramKey': key(),
        'AcquireProgramFriendlyName': 'My Acquire Program %s' % az()
    }

    acquires = []
    acquire_count = randint(1, 3)

    for i in range(0, acquire_count):

        acquire = {
            'AcquireKey': key(),
            'AcquireStartTime': '12:34:56',
            'AcquireEndTime': '12:51:15',
            'AcquireStatus': get_state(),
            'AcquireErrorMessage': None,
            'Options': []
        }

        option_count = randint(1, 5)
        for j in range(0, option_count):
            acquire['Options'].append({
                'AcquireOptionName': 'Name %s' % az(),
                'AcquireOptionValue': 'Value %s' % az()
            })

        acquires.append(acquire)

    extract = {
        'ExtractKey': key(),
        'ExtractDestination': 'Destination %s' % az(),
        'ExtractStartTime': '19:23:35',
        'ExtractEndTime': '19:38:16',
        'ExtractStatus': get_state(),
        'ExtractErrorMessage': None,
        'Options': []
    }

    option_count = randint(1, 5)
    for i in range(0, option_count):
        extract['Options'].append({
            'ExtractOptionName': 'Name %s' % az(),
            'ExtractOptionValue': 'Value %s' % az()
        })

    return {
        'data': {
            'execution': execution,
            'acquires': acquires,
            'extract': extract
        }
    }

def az():
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return letters[randint(1, len(letters)) - 1]

def key():
    return randint(1, 1000)

# State randomiser
def get_state(prev_state=None):

    SUCCESS = 'success'
    FAILURE = 'failure'
    RUNNING = 'running'
    WAITING = 'waiting'

    if prev_state == FAILURE:
        return FAILURE
    if prev_state == RUNNING:
        return WAITING
    if prev_state == WAITING:
        return WAITING

    n = random()
    if n > .3:
        return SUCCESS
    if n > .1:
        return FAILURE
    if n > .05:
        return RUNNING

    return WAITING


# Schedules

def get_schedules(limit):

    # Small delay
    sleep(1)

    schedules = []

    for i in range(0, limit):

        schedules.append({
            'ScheduledExecutionKey': key(),
            'ScheduledExecutionName': 'Execution %s' % az(),
            'ScheduledExecutionNextScheduled': get_next_date(),
            'ScheduledExecutionScheduleEnd': get_next_date(),
            'ScheduledExecutionClientName': 'Client Name %s' % az(),
            'ScheduledExecutionDataSourceName': 'Data Source %s' % az(),
            'ScheduledExecutionDataSetName': 'Data Set %s' % az(),
            'ScheduledExecutionNextLoadDate': get_load_date(),
            'ScheduledExecutionEnabled': random() > .2,
            'ScheduledExecutionUser': 'User %s' % az(),
            'ScheduledExecutionStatus': get_state()
        })

    return {
        'data': schedules
    }


def get_schedule(id):

    execution = {
        'ScheduledExecutionKey': id,
        'ScheduledExecutionName': 'Schedule %s' % az(),
        'ScheduledExecutionNextScheduled': get_next_date(),
        'ScheduledExecutionScheduleEnd': get_next_date(),
        'ScheduledExecutionClientName': 'Client %s' % az(),
        'ScheduledExecutionDataSourceName': 'Data Source %s' % az(),
        'ScheduledExecutionDataSetName': 'Data Set %s' % az(),
        'ScheduledExecutionNextLoadDate': get_load_date(),
        'ScheduledExecutionEnabled': random() > .2,
        'ScheduledExecutionUser': 'User %s' % az(),
        'ScheduledIntervalKey': key(),
        'ScheduledIntervalMI': randint(0, 59),
        'ScheduledIntervalHH': randint(0, 23),
        'ScheduledIntervalDD': randint(0, 7),
        'ScheduledMondayEnabled': random() > .3,
        'ScheduledTuesdayEnabled': random() > .3,
        'ScheduledWednesdayEnabled': random() > .3,
        'ScheduledThursdayEnabled': random() > .3,
        'ScheduledFridayEnabled': random() > .3,
        'ScheduledSaturdayEnabled': random() > .3,
        'ScheduledSundayEnabled': random() > .3,
        'AcquireProgramKey': randint(1, 4),
        'AcquireProgramFriendlyName': 'My Acquire Program %s' % az(),
        'ScheduledExecutionStatus': get_state()
    }

    acquires = []
    acquire_count = randint(0, 4)

    for i in range(0, acquire_count):

        acquires.append({
            'ScheduledAcquireKey': key(),
            'ScheduledAcquireName': 'Acquire Name %s' % az(),
            'Options': get_scheduled_acquire_options()
        })

    extract = {
        'ScheduledExtractDestination': get_extract_program(),
        'Options': get_extract_program_option_values()
    }

    return {
        'data': {
            'execution': execution,
            'acquires': acquires,
            'extract': extract
        }
    }


def get_next_date():
    return datetime.now() + timedelta(days=randint(0, 7))

def get_load_date():
    return datetime.now() - timedelta(days=randint(0, 7))


# Acquire Programs

def get_acquire_programs():

    data = []

    for i in range(1, 6):
        data.append(get_acquire_program(i))

    return {
        'data': data
    }

def get_acquire_program(id):

    return {
        'AcquireProgramKey': id,
        'AcquireProgramPythonName': 'PythonProgram%s' % az(),
        'AcquireProgramFriendlyName': 'My Acquire Program %s' % az(),
        'AcquireProgramDataSource': 'Data Source %s' % az(),
        'AcquireProgramEnabled': (id != 5),
        'Options': get_acquire_program_options()
    }


# These two methods return static data, so that available options match pre-entered options

def get_acquire_program_options():

    return [{
            'AcquireProgramOptionName': 'Name A',
            'AcquireProgramOptionRequired': True
        }, {
            'AcquireProgramOptionName': 'Name B',
            'AcquireProgramOptionRequired': True
        }, {
            'AcquireProgramOptionName': 'Name C',
            'AcquireProgramOptionRequired': False
        }
    ]


def get_scheduled_acquire_options():

    return [{
            'ScheduledAcquireOptionName': 'Name A',
            'ScheduledAcquireOptionValue': 'Value A'
        }, {
            'ScheduledAcquireOptionName': 'Name B',
            'ScheduledAcquireOptionValue': 'Value B'
        }, {
            'ScheduledAcquireOptionName': 'Name C',
            'ScheduledAcquireOptionValue': 'Value C'
        }
    ]


def get_extract_programs():

    data = []
    programs = get_available_extract_programs()

    for program in programs:

        data.append({
            'ExtractProgramPythonName': 'PythonProgram%s' % az(),
            'ExtractProgramFriendlyName': program,
            'Options': get_extract_program_options()
        })

    return {
        'data': data
    }


def get_extract_program():
    # Return a program at random
    programs = get_available_extract_programs()
    return programs[randint(0, len(programs) - 1)]


def get_available_extract_programs():
    return [
        'My Program A',
        'My Program B',
        'My Program C'
    ]


def get_extract_program_options():

    return [{
            'ExtractProgramOptionName': 'Name A',
            'ExtractProgramOptionRequired': True
        }, {
            'ExtractProgramOptionName': 'Name B',
            'ExtractProgramOptionRequired': True
        }, {
            'ExtractProgramOptionName': 'Name C',
            'ExtractProgramOptionRequired': False
        }
    ]


def get_extract_program_option_values():

    return [{
            'ScheduledExtractOptionName': 'Name A',
            'ScheduledExtractOptionValue': 'Value %s' % az()
        }, {
            'ScheduledExtractOptionName': 'Name B',
            'ScheduledExtractOptionValue': 'Value %s' % az()
        }, {
            'ScheduledExtractOptionName': 'Name C',
            'ScheduledExtractOptionValue': 'Value %s' % az()
        }
    ]
