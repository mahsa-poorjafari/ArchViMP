document.addEventListener('DOMContentLoaded', function() {
    let benchmarkName = get_url_benchmark();
    document.getElementsByClassName('navbar')[0].getElementsByClassName('title_name')[0].innerHTML = benchmarkName + ' Benchmark    ';

});
