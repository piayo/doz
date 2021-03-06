const h = require('../src/vdom/h');
const mapper = require('../src/vdom/mapper');

describe('h', function () {

    beforeEach(function () {
        document.body.innerHTML = '';
    });

    describe('create', function () {
        it('should be ok', function () {
            document.body.innerHTML = `<div id="app"></div>`;
            let arr = [0,1,2,3,4,5];
            const res = h`
                <div>hello ${'ciao'}
                    <button disabled>testo</button>
                    ${h`
                        <div>bau</div>
                        <ul>${arr.map(i => h`<li>${i} ciao ${h`<span>foobar ${Date.now()}</span>`}</li>`)}</ul>
                    `}
                </div>
                `;

            console.log(mapper.data);
            console.log(JSON.stringify(res, null, 4));
        });
    });
});